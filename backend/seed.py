import random
import datetime
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.transaction import Transaction
from app.models.recovery_action import RecoveryAction
from app.ai.recovery_engine import AIRecoveryEngine

# Authentic Indian Names
INDIAN_NAMES = [
    "Arjun Kumar", "Priya Sharma", "Vikram Patel", "Ananya Iyer", "Rajesh Verma",
    "Sneha Reddy", "Amit Joshi", "Kavita Rao", "Rohan Mehta", "Pooja Deshmukh",
    "Siddharth Malhotra", "Neha Nair", "Aditya Sengupta", "Divya Menon", "Suresh Pillai",
    "Deepak Agarwal", "Ritu Kapoor", "Manish Choudhury", "Meera Bhatt", "Karan Singhania",
    "Sunil Gavaskar", "Aarti Saxena", "Tarun Bansal", "Shweta Kulkarni", "Varun Chopra",
    "Swati Mukhopadhyay", "Nikhil Hegde", "Isha Mittal", "Ganesh Gowda", "Bhavna Jain",
    "Abhinav Tripathi", "Richa Pandey", "Rahul Dravid", "Preeti Sundaram", "Harish Natarajan",
    "Archana Mohanty", "Vivek Anand", "Kirti Das", "Alok Roy", "Sangeeta Nambiar",
    "Rishabh Pant", "Sanaya Irani", "Devendra Jha", "Payal Bhatia", "Ashok Solanki",
    "Smriti Mandhana", "Venkatesh Prasad", "Radhika Merchant", "Gaurav Taneja", "Meenal Shah"
]

PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"]

FAILURE_REASONS = [
    "Temporary Bank Error",
    "Insufficient Funds",
    "Network Error",
    "Expired Card",
    "Invalid Payment Details",
    "Bank Declined",
    "Timeout"
]

def seed_database():
    print("Re-creating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("Generating 55 synthetic failed & recovered payment transactions...")
        now = datetime.datetime.utcnow()
        transactions = []

        for i in range(1, 56):
            txn_id = f"TXN{1000 + i}"
            customer = INDIAN_NAMES[(i - 1) % len(INDIAN_NAMES)]
            
            # Amount ranges: Mix of small, medium, and high enterprise values
            if i % 7 == 0:
                amount = round(random.uniform(45000.0, 150000.0), 2)  # High Enterprise
            elif i % 3 == 0:
                amount = round(random.uniform(12000.0, 44000.0), 2)   # Mid Market
            else:
                amount = round(random.uniform(500.0, 11500.0), 2)     # SMB / Retail

            payment_method = random.choice(PAYMENT_METHODS)
            failure_reason = random.choice(FAILURE_REASONS)
            attempt_count = random.randint(1, 4)

            # Dates spread over last 14 days
            days_ago = random.randint(0, 14)
            hours_ago = random.randint(1, 23)
            tx_date = now - datetime.timedelta(days=days_ago, hours=hours_ago)

            # Evaluate AI Recovery Score
            ai_result = AIRecoveryEngine.evaluate_transaction(
                amount=amount,
                failure_reason=failure_reason,
                payment_method=payment_method,
                attempt_count=attempt_count,
                transaction_date=tx_date
            )

            # Assign Status: 15% already RECOVERED, 10% PENDING_RECOVERY, 75% FAILED
            if i in [3, 8, 14, 21, 29, 36, 42, 50]:
                status = "RECOVERED"
            elif i in [5, 12, 19, 27, 33, 44]:
                status = "PENDING_RECOVERY"
            else:
                status = "FAILED"

            txn = Transaction(
                transaction_id=txn_id,
                customer_name=customer,
                amount=amount,
                currency="INR",
                payment_method=payment_method,
                failure_reason=failure_reason,
                status=status,
                attempt_count=attempt_count,
                transaction_date=tx_date,
                recovery_probability=ai_result["recovery_probability"],
                priority_score=ai_result["priority_score"],
                priority=ai_result["priority"],
                recommended_action=ai_result["recommended_action"],
                created_at=tx_date,
                updated_at=tx_date
            )
            db.add(txn)
            transactions.append(txn)

        db.commit()

        # Add initial recovery actions for already recovered or pending items
        print("Generating historical recovery action logs...")
        recovered_txns = db.query(Transaction).filter(Transaction.status == "RECOVERED").all()
        for txn in recovered_txns:
            action = RecoveryAction(
                transaction_id=txn.transaction_id,
                action_type=txn.recommended_action,
                status="SUCCESS",
                result=f"Payment recovered successfully via {txn.recommended_action}.",
                notes="Automated recovery trigger executed.",
                executed_at=txn.transaction_date + datetime.timedelta(hours=2),
                created_at=txn.transaction_date + datetime.timedelta(hours=2)
            )
            db.add(action)

        db.commit()
        print(f"Successfully seeded database with {len(transactions)} synthetic records.")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
