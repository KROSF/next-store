import React, { Component } from 'react';
import Link from 'next/link';
import StyledProduct from './styles/ProductStyles';
import ProductVariants from './ProductVariants';
import product from '../lib/dummyData';


class Product extends Component {
  render() {
    const id = this.props.id;
    return (
      <StyledProduct>
        <div className="buy-prdct-imgs">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="buy-prdct-content">
          <h3 className="buy-prdct-title buy-prdct-padding">
            {product.title}
          </h3>

          <div className="buy-prdct-creator buy-prdct-padding">
            By
            <Link href={{
              pathname: `/shop`,
              query: {
                name: `${product.user.name}`,
                online: true
              }
            }}>
              <a> {product.user.name}</a>
            </Link>
          </div>

          {product.productVariants && product.productVariants.length &&
            <ProductVariants
              productId={product.id}
              allVariants={product.productVariants}
              online={product.online}
            />
          }

          <div className="buy-prdct-desc buy-prdct-padding">
            <strong>Description:</strong>
            <p>{product.description}</p>

            {product.brand && (
              <div className="buy-prdct-brand">
                <strong>Brand: </strong>{product.brand}
              </div>
            )}
          </div>
        </div>
      </StyledProduct>
    );
  }
}

export default Product;
