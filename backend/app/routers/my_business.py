from fastapi import APIRouter, HTTPException

from app.mock_data_loader import load_json

router = APIRouter(prefix="/api", tags=["my-business"])


@router.get("/products")
def get_products():
    return load_json("products.json")


@router.get("/products/{product_id}")
def get_product(product_id: str):
    products = load_json("products.json")
    for product in products:
        if product["product_id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")


@router.get("/transactions")
def get_transactions():
    return load_json("transactions.json")


@router.get("/tax-status")
def get_tax_status():
    return load_json("tax-status.json")
