import pandas as pd
import random

# -----------------------------
# CONFIGURATION
# -----------------------------
NUM_ROWS = 364
MIN_PROBABILITY = 0.25

regions = ["North", "South", "East", "West"]

data = []

for case_id in range(1, NUM_ROWS + 1):

    # Invoice amount (FedEx logistics invoice)
    amount_due = random.randint(2_000, 20_000)

    # Days overdue (invoice delay)
    days_overdue = random.randint(1, 180)

    # Past defaults by client
    past_defaults = random.randint(0, 5)

    region = random.choice(regions)

    # ---------------------------------
    # BUSINESS-REALISTIC RECOVERY LOGIC
    # ---------------------------------

    # Base probability decay based on days overdue
    if days_overdue <= 15:
        base_prob = random.uniform(0.95, 1.00)
    elif days_overdue <= 30:
        base_prob = random.uniform(0.85, 0.90)
    elif days_overdue <= 45:
        base_prob = random.uniform(0.70, 0.85)
    elif days_overdue <= 90:
        base_prob = random.uniform(0.40, 0.55)
    else:
        base_prob = random.uniform(0.25, 0.40)

    # Penalize for bad payment history
    history_penalty = past_defaults * 0.05
    recovery_probability = max(base_prob - history_penalty, MIN_PROBABILITY)

    # Simulate recovery outcome (Bernoulli trial)
    recovered = 1 if random.random() < recovery_probability else 0

    data.append({
        "case_id": case_id,
        "amount_due": amount_due,
        "days_overdue": days_overdue,
        "past_defaults": past_defaults,
        "region": region,
        "recovered": recovered
    })

# Create DataFrame
df = pd.DataFrame(data)

# Save raw dataset
df.to_csv("invoice_recovery_raw_data.csv", index=False)

print("✅invoice recovery dataset generated successfully!")
print(df.head())
