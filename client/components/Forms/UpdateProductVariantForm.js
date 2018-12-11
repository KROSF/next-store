import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import ProductVariantFormFields from './ProductVariantFormFields';
import StyledForm from '../styles/FormStyles';
import { UPDATE_PROD_VARIANT_WITH_IMAGE_MUTATION } from '../../graphql';


class UpdateProductVariantForm extends Component {
  static propTypes = {
    variant: PropTypes.shape({
      id: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      size: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      sale: PropTypes.bool.isRequired,
      salePrice: PropTypes.number.isRequired,
      image: PropTypes.shape({
        id: PropTypes.string,
        cloudinary_id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        transformation: PropTypes.string.isRequired,
        image_url: PropTypes.string.isRequired,
        large_image_url: PropTypes.string.isRequired,
        delete_token: PropTypes.string
      }),
      product: PropTypes.shape({
        image: PropTypes.shape({
          id: PropTypes.string.isRequired,
          cloudinary_id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          width: PropTypes.number.isRequired,
          height: PropTypes.number.isRequired,
          transformation: PropTypes.string.isRequired,
          image_url: PropTypes.string.isRequired,
          large_image_url: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  };
  state = { ...this.props.variant };
  saveToState = state => {
    if (typeof state.getNewImage !== 'undefined') {
      const { image, product } = this.props.variant;
      const previousImage = (!!image && image.cloudinary_id !== product.image.cloudinary_id)
        ? image
        : null;
      const overwrittenImage = state.getNewImage
        ? previousImage
        : product.image;
      this.setState({ image: overwrittenImage });
    } else {
      this.setState({ ...state });
    }
  }
  getUpdateProdVarVariables = () => {
    const image = { ...this.state.image };
    if (!!image.delete_token) delete image.delete_token;
    delete image.id;

    let variables = {
      ...this.state,
      ...image
    };
    delete variables.image;
    delete variables.product;

    return variables;
  }
  render() {
    return (
      <Mutation mutation={UPDATE_PROD_VARIANT_WITH_IMAGE_MUTATION}
        variables={this.getUpdateProdVarVariables()}
      >
        {(updateProductVariantWithImage, { loading, error }) => (
          <StyledForm
            data-test="form"
            onSubmit={async e => {
              e.preventDefault();
              const res = await updateProductVariantWithImage();
              Router.push({
                pathname: "/buy",
                query: { id: res.data.updateProductVariantWithImage.product.id },
              });
            }}
          >
            {error && (
              <div>{error}</div>
            )}

            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Update Selection</h2>

              <ProductVariantFormFields
                price={this.state.price}
                quantity={this.state.quantity}
                color={this.state.color}
                size={this.state.size}
                sale={this.state.sale}
                salePrice={this.state.salePrice}
                image={this.state.image}
                saveToForm={this.saveToState}
                editView={true}
              />

              <button className="form-submit-btn big-btn"
                disabled={!this.state.image || loading}
                type="submit"
              >Update</button>
            </fieldset>
          </StyledForm>
        )}
      </Mutation>
    );
  }
}


export { UpdateProductVariantForm };
