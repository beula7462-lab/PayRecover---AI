"""Initial migration schema for PayRecover AI

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-29 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transaction_id', sa.String(length=64), nullable=False),
        sa.Column('customer_name', sa.String(length=128), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
        sa.Column('payment_method', sa.String(length=64), nullable=False),
        sa.Column('failure_reason', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='FAILED'),
        sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('transaction_date', sa.DateTime(), nullable=False),
        sa.Column('recovery_probability', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('priority_score', sa.Float(), nullable=False, server_default='50.0'),
        sa.Column('priority', sa.String(length=16), nullable=False, server_default='MEDIUM'),
        sa.Column('recommended_action', sa.String(length=64), nullable=False, server_default='RETRY_PAYMENT'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    op.create_index(op.f('ix_transactions_transaction_id'), 'transactions', ['transaction_id'], unique=True)
    op.create_index(op.f('ix_transactions_payment_method'), 'transactions', ['payment_method'], unique=False)
    op.create_index(op.f('ix_transactions_failure_reason'), 'transactions', ['failure_reason'], unique=False)
    op.create_index(op.f('ix_transactions_status'), 'transactions', ['status'], unique=False)
    op.create_index(op.f('ix_transactions_transaction_date'), 'transactions', ['transaction_date'], unique=False)
    op.create_index(op.f('ix_transactions_priority_score'), 'transactions', ['priority_score'], unique=False)

    op.create_table(
        'recovery_actions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transaction_id', sa.String(length=64), nullable=False),
        sa.Column('action_type', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('result', sa.String(length=128), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('executed_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.transaction_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recovery_actions_id'), 'recovery_actions', ['id'], unique=False)
    op.create_index(op.f('ix_recovery_actions_transaction_id'), 'recovery_actions', ['transaction_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_recovery_actions_transaction_id'), table_name='recovery_actions')
    op.drop_index(op.f('ix_recovery_actions_id'), table_name='recovery_actions')
    op.drop_table('recovery_actions')
    op.drop_index(op.f('ix_transactions_priority_score'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_transaction_date'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_status'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_failure_reason'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_payment_method'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_transaction_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
