import {
  CURRENT_USER_QUERY,
  SIGNOUT_MUTATION,
  ADD_TO_CART_MUTATION, REMOVE_FROM_CART_MUTATION, UPDATE_CARTITEM_MUTATION,
  SHOP_PRODUCTS_QUERY,
  DELETE_PRODUCT_MUTATION,
} from '../graphql';
import {
  fakeUser, fakeImage, fakeProduct, fakeCartItem, fakeVariant,
} from './testUtils';

const mockUser = fakeUser();
const mockImage = fakeImage();
const mockProduct = fakeProduct();
const mockCartItem = fakeCartItem();
const mockVariant = fakeVariant();
const mockShopProductsVariables = {
  name: mockUser.name,
  orderBy: 'createdAt_DESC',
  skip: 0,
  first: 1
 };


const userQueryEmptyCartMock = {
  request: { query: CURRENT_USER_QUERY },
  result: {
    data: {
      me: {
        ...mockUser,
        cart: [],
      },
    },
  },
};

const userQueryNoUserMock = {
  request: { query: CURRENT_USER_QUERY },
  result: {
    data: { me: null }
  },
};

const signoutMutationMock = {
  request: { query: SIGNOUT_MUTATION },
  result: {
    data: {
      signout: {
        __typename: 'Message',
        success: true,
        message: 'Goodbye!'
      },
    },
  },
};

const userQueryCartItemMock = overrides => ({
  request: { query: CURRENT_USER_QUERY },
  result: {
    data: {
      me: {
        ...mockUser,
        cart: [{
          ...mockCartItem,
          ...overrides
        }],
      },
    },
  },
});

const addToCartMutationMock = {
  request: { query: ADD_TO_CART_MUTATION, variables: { id: mockVariant.id } },
  result: {
    data: {
      addToCart: {
        __typename: mockCartItem.__typename,
        id: mockCartItem.id,
      },
    },
  },
};

const removeFromCartMutationMock = {
  request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: mockCartItem.id } },
  result: {
    data: {
      removeFromCart: {
        __typename: mockCartItem.__typename,
        id: mockCartItem.id,
      },
    },
  },
};

const updateCartItemMutationMock = (quantity) => ({
  request: { query: UPDATE_CARTITEM_MUTATION, variables: { id: mockCartItem.id, quantity } },
  result: {
    data: {
      updateCartItem: {
        __typename: mockCartItem.__typename,
        id: mockCartItem.id,
        quantity,
        variant: { ...mockCartItem.variant }
      },
    },
  },
});

const shopProductsQueryNameEmptyMock = {
  request: { query: SHOP_PRODUCTS_QUERY, variables: { name: mockUser.name }},
  result: {
    data: {
      products: [],
    },
  },
};

const deleteProductMutationMock = {
  request: { query: DELETE_PRODUCT_MUTATION, variables: { id: mockProduct.id } },
  result: {
    data: {
      deleteProduct: {
        __typename: 'Product',
        id: mockProduct.id,
      },
    },
  },
};


export {
  mockUser,
  mockShopProductsVariables,
  userQueryNoUserMock,
  userQueryEmptyCartMock,
  signoutMutationMock,
  userQueryCartItemMock,
  addToCartMutationMock,
  updateCartItemMutationMock,
  removeFromCartMutationMock,
  shopProductsQueryNameEmptyMock,
  deleteProductMutationMock,
};