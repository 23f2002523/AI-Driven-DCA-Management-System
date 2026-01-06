from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import os

app = Flask(__name__)

# Enable CORS for React frontend (localhost:3000)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Path to the CSV file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, 'data', 'predicted_cases.csv')


def load_cases():
    """Load cases from CSV file"""
    try:
        if not os.path.exists(CSV_PATH):
            return []
        
        cases = []
        with open(CSV_PATH, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                cases.append(row)
        
        return cases
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return []


def map_priority(recovery_prob):
    """Map recovery probability to priority level"""
    try:
        prob = float(recovery_prob)
        if prob >= 0.7:
            return 'High'
        elif prob >= 0.3:
            return 'Medium'
        else:
            return 'Low'
    except:
        return 'Low'


@app.route('/api/admin/cases', methods=['GET'])
def get_admin_cases():
    """
    Get ALL cases for Admin Dashboard
    Returns all cases from predicted_cases.csv
    """
    try:
        raw_cases = load_cases()
        
        if not raw_cases:
            return jsonify({
                'success': True,
                'cases': [],
                'message': 'No cases found'
            }), 200
        
        # Prepare cases for frontend
        cases = []
        for row in raw_cases:
            try:
                case = {
                    'id': int(row['case_id']),
                    'debtor_name': f"Debtor #{int(row['case_id'])}",  # Mock name
                    'amount': float(row['amount_due']),
                    'days_overdue': int(row['days_overdue']),
                    'status': 'resolved' if int(row.get('recovered', 0)) == 1 else 'active',
                    'recovery_probability': float(row['recovery_probability']),
                    'ai_priority': row.get('priority', map_priority(float(row['recovery_probability']))),
                    'region': row.get('region', 'Unknown'),
                    'past_defaults': int(row.get('past_defaults', 0))
                }
                cases.append(case)
            except (ValueError, KeyError) as e:
                print(f"Skipping invalid row: {e}")
                continue
        
        return jsonify({
            'success': True,
            'cases': cases,
            'total': len(cases)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'cases': []
        }), 500


@app.route('/api/dca/cases', methods=['GET'])
def get_dca_cases():
    """
    Get ASSIGNED cases for DCA Dashboard
    Returns only a subset of cases (mock assignment logic: even case_ids)
    """
    try:
        raw_cases = load_cases()
        
        if not raw_cases:
            return jsonify({
                'success': True,
                'cases': [],
                'message': 'No assigned cases found'
            }), 200
        
        # Prepare cases for frontend
        cases = []
        for row in raw_cases:
            try:
                case_id = int(row['case_id'])
                
                # Mock assignment logic: Only return cases with even case_id
                if case_id % 2 == 0:
                    case = {
                        'id': case_id,
                        'amount': float(row['amount_due']),
                        'days_overdue': int(row['days_overdue']),
                        'ai_priority': row.get('priority', map_priority(float(row['recovery_probability']))),
                        'recovery_probability': float(row['recovery_probability']),
                        'region': row.get('region', 'Unknown')
                    }
                    cases.append(case)
            except (ValueError, KeyError) as e:
                print(f"Skipping invalid row: {e}")
                continue
        
        return jsonify({
            'success': True,
            'cases': cases,
            'total': len(cases)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'cases': []
        }), 500


@app.route('/api/admin/metrics', methods=['GET'])
def get_admin_metrics():
    """
    Get aggregated metrics for Admin Dashboard
    Returns:
    - total_cases
    - high_priority_cases
    - avg_recovery_probability
    - cases_at_risk (days_overdue > 90)
    """
    try:
        raw_cases = load_cases()
        
        if not raw_cases:
            return jsonify({
                'success': True,
                'metrics': {
                    'total_cases': 0,
                    'high_priority_cases': 0,
                    'avg_recovery_probability': 0,
                    'cases_at_risk': 0
                }
            }), 200
        
        # Calculate metrics
        total_cases = len(raw_cases)
        high_priority_cases = 0
        total_recovery_prob = 0
        cases_at_risk = 0
        active_cases = 0
        resolved_cases = 0
        
        for row in raw_cases:
            try:
                recovery_prob = float(row['recovery_probability'])
                days_overdue = int(row['days_overdue'])
                recovered = int(row.get('recovered', 0))
                priority = row.get('priority', '')
                
                # High priority cases
                if recovery_prob >= 0.7 or priority == 'High':
                    high_priority_cases += 1
                
                # Sum recovery probability for average
                total_recovery_prob += recovery_prob
                
                # Cases at risk
                if days_overdue > 90:
                    cases_at_risk += 1
                
                # Active vs resolved
                if recovered == 1:
                    resolved_cases += 1
                else:
                    active_cases += 1
                    
            except (ValueError, KeyError) as e:
                print(f"Skipping invalid row in metrics: {e}")
                continue
        
        avg_recovery_prob = total_recovery_prob / total_cases if total_cases > 0 else 0
        
        metrics = {
            'total_cases': total_cases,
            'high_priority_cases': high_priority_cases,
            'avg_recovery_probability': round(avg_recovery_prob, 4),
            'cases_at_risk': cases_at_risk,
            'active_cases': active_cases,
            'resolved_cases': resolved_cases
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'metrics': {}
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI-Driven DCA Management System API is running',
        'csv_loaded': os.path.exists(CSV_PATH)
    }), 200


@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'AI-Driven DCA Management System API',
        'version': '1.0.0',
        'endpoints': {
            'admin_cases': '/api/admin/cases',
            'dca_cases': '/api/dca/cases',
            'admin_metrics': '/api/admin/metrics',
            'health': '/api/health'
        }
    }), 200


if __name__ == '__main__':
    # Check if CSV exists on startup
    if os.path.exists(CSV_PATH):
        print(f"✓ CSV file found: {CSV_PATH}")
        cases = load_cases()
        print(f"✓ Loaded {len(cases)} cases from CSV")
    else:
        print(f"✗ Warning: CSV file not found at {CSV_PATH}")
    
    # Run Flask app
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
