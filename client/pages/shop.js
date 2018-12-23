import { Query } from 'react-apollo';
import { StyledShopPage } from '../components/styles/PageStyles';
import NotFound from '../components/NotFound';
import PageTitle from '../components/PageTitle';
import ProductsList from '../components/ProductsList';
import { capWord } from '../lib/utilFns';
import { user } from '../lib/dummyData';
import { SHOP_PRODUCTS_QUERY } from '../graphql';


function getShopProps(variables = {}) {
  let pageLabel = '';
  let editView = false;
  variables.online = true;

  if (variables.department) {
    pageLabel = capWord(variables.department);
  } else if (variables.name) {
    if (variables.name === user.name) {
      pageLabel = 'My Products';
      delete variables.online;
      editView = true;
    } else {
      pageLabel = capWord(variables.name);
    }
  }

  return { variables, pageLabel, editView };
}

const Shop = props => {
  const shopProps = getShopProps(props.query);
  const { variables, pageLabel, editView } = shopProps;
  return (
    <StyledShopPage>
      <PageTitle
        page={pageLabel}
        titles={[]}
      />

      <div className="shop-pg-filters">
        Filters
      </div>

      <div className="shop-pg-lst">
        <div className="shop-pg-pagin">
          <div>Sort here</div>

          <div>Pagination here</div>
        </div>

        <Query query={SHOP_PRODUCTS_QUERY}
          variables={variables}
        >
          {({ data, error, loading }) => {
            if (loading) return (<p>Loading...</p>);
            if (error) return (
              <NotFound status={400} message={error.message} />
            );
            const { products } = data;
            if (typeof products === 'undefined' || products === null) return (
              <NotFound status={404} />
            );
            if (!products.length) return (
              <NotFound status={204} message='No products found.' />
            );
            return (
              <ProductsList
                products={products}
                editView={editView}
              />
            );
          }}
        </Query>

        <div className="shop-pg-pagin">
          <div>Sort here</div>

          <div>Pagination here</div>
        </div>
      </div>
    </StyledShopPage>
  );
};

export default Shop;
