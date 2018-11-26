
const user = {
  id: "cjoxto7d5l5z70a713fae9fur",
  name: 'alexy',
  email: 'alexy@gmail.com'
};

const productVariants = [
  {
    id: "cjo8awitz7ox30a01gbzxtr4y",
    quantity: 3,
    color: "Black",
    size: "S",
    price: 4400,
    sale: true,
    salePrice: 2200
  }, {
    id: "cjo8awitz7ox30a01gbzxtr4y",
    quantity: 3,
    color: "Black",
    size: "M",
    price: 4400,
    sale: false,
    salePrice: 0
  }, {
    id: "cjo8awitz7ox30a01gbzxtr4y",
    quantity: 2,
    color: "Red",
    size: "S",
    price: 4000,
    sale: true,
    salePrice: 20
  }
];

const product = {
  id: "cjoc0irhbo26r0a0121ub69i3",
  department: "Accessories",
  title: "Peggs Gold Edition Analog Watch Peggs Gold Edition Analog ",
  description: "Limited Edition watch from the 2018 Fall fashion line.",
  image: "peggswatch.jpg",
  category: "Sport",
  brand: "Peggs",
  online: false,
  url: "",
  user,
  productVariants
};


const products = [
  product,
  {
    id: "cjoc0oaljo2kj0a01qmdo08ai",
    department: "Accessories",
    title: "Pegggy",
    description: "Limited.",
    image: "peggswatch2.jpg",
    category: "Sport",
    brand: "Peggs",
    online: true,
    url: "",
    user,
    productVariants
  }
];

export default product;
export {
  productVariants,
  products,
  user
};
