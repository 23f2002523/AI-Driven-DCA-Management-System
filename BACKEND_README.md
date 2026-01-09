# AI-Driven DCA Management System - Backend

## Flask Backend Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the project root directory:**
   ```bash
   cd AI-Driven-DCA-Management-System
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirments.txt
   ```

### Running the Backend

1. **Start the Flask server:**
   ```bash
   python app/app.py
   ```

2. **The server will start on:**
   ```
   http://localhost:5000
   ```

3. **Verify it's running:**
   Open browser and go to: http://localhost:5000
   You should see the API welcome message.

### API Endpoints

#### 1. **GET /api/admin/cases**
- **Purpose:** Get all cases for Admin Dashboard
- **Returns:** All cases from `predicted_cases.csv`
- **Example:**
  ```bash
  curl http://localhost:5000/api/admin/cases
  ```

#### 2. **GET /api/dca/cases**
- **Purpose:** Get assigned cases for DCA Dashboard
- **Returns:** Subset of cases (even case_ids only)
- **Example:**
  ```bash
  curl http://localhost:5000/api/dca/cases
  ```

#### 3. **GET /api/admin/metrics**
- **Purpose:** Get aggregated metrics for Admin Dashboard
- **Returns:**
  - total_cases
  - high_priority_cases
  - avg_recovery_probability
  - cases_at_risk (days_overdue > 90)
- **Example:**
  ```bash
  curl http://localhost:5000/api/admin/metrics
  ```

#### 4. **GET /api/health**
- **Purpose:** Health check endpoint
- **Returns:** Server status and CSV load status

### Data Source

The backend reads from:
```
data/predicted_cases.csv
```

This CSV contains ML model predictions with columns:
- case_id
- amount_due
- days_overdue
- past_defaults
- region
- recovered
- recovery_probability
- priority

### CORS Configuration

CORS is enabled for:
- `http://localhost:3000` (React frontend)

### Troubleshooting

**Issue:** ModuleNotFoundError
- **Solution:** Make sure virtual environment is activated and dependencies are installed

**Issue:** CSV not found
- **Solution:** Ensure `data/predicted_cases.csv` exists in the project root

**Issue:** Port 5000 already in use
- **Solution:** Change port in `app/app.py` (last line) or kill the process using port 5000

### Running Both Frontend and Backend

1. **Terminal 1 - Backend:**
   ```bash
   cd AI-Driven-DCA-Management-System
   python app/app.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd AI-Driven-DCA-Management-System/frontend
   npm start
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- CORS is enabled between them
- No authentication required (mocked with test credentials)
- Data is loaded from CSV file on each request
