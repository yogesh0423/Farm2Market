"""Add product and order fields

Revision ID: 49c36c1eb78e
Revises: 0960a465c9e4
Create Date: 2026-08-14 15:16:01.210664
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '49c36c1eb78e'
down_revision = '0960a465c9e4'
branch_labels = None
depends_on = None


def upgrade():
    # Update the existing orders table.
    #
    # The table currently has 0 rows, so the new non-null columns
    # can be added safely.

    with op.batch_alter_table('orders', schema=None) as batch_op:

        # Add new order fields
        batch_op.add_column(
            sa.Column('product_id', sa.Integer(), nullable=False)
        )

        batch_op.add_column(
            sa.Column('quantity', sa.Float(), nullable=False)
        )

        batch_op.add_column(
            sa.Column('total_price', sa.Float(), nullable=False)
        )

        # Change status length
        batch_op.alter_column(
            'status',
            existing_type=sa.VARCHAR(length=30),
            type_=sa.String(length=50),
            existing_nullable=True
        )

        # Remove old order fields
        batch_op.drop_column('total_amount')
        batch_op.drop_column('farmer_id')
        batch_op.drop_column('shipping_address')

    # Add the new product foreign key separately with an explicit name.
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_foreign_key(
            'fk_orders_product_id',
            'products',
            ['product_id'],
            ['id']
        )


def downgrade():

    # Remove product foreign key
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_constraint(
            'fk_orders_product_id',
            type_='foreignkey'
        )

    # Restore the previous structure
    with op.batch_alter_table('orders', schema=None) as batch_op:

        batch_op.add_column(
            sa.Column(
                'shipping_address',
                sa.TEXT(),
                nullable=False
            )
        )

        batch_op.add_column(
            sa.Column(
                'farmer_id',
                sa.INTEGER(),
                nullable=False
            )
        )

        batch_op.add_column(
            sa.Column(
                'total_amount',
                sa.FLOAT(),
                nullable=False
            )
        )

        batch_op.alter_column(
            'status',
            existing_type=sa.String(length=50),
            type_=sa.VARCHAR(length=30),
            existing_nullable=True
        )

        batch_op.drop_column('total_price')
        batch_op.drop_column('quantity')
        batch_op.drop_column('product_id')

    # Restore farmer foreign key
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_foreign_key(
            'fk_orders_farmer_id',
            'users',
            ['farmer_id'],
            ['id']
        )