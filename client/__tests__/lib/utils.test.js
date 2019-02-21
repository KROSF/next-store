import {
  objctsDiffer,
  getUniqKeyVals,
  getFltrdObjs,
  capWord,
  formatMoney,
  getPageTitleProps,
  getFilterProps,
  getCartTotals
} from '../../lib/utils';
import {
  mockProduct, mockVariant, mockUser, mockCartItem, mockImage,
} from '../../lib/test-utils/mocks';
import {
  SALES_TAX_RATE, SHIPPING_COST_PER_ITEM
} from '../../config';


describe('Util functions', () => {

  describe('capWord fn', () => {
    it('invalid/empty input returns an empty string', () => {
      expect(capWord()).toEqual('');
      expect(capWord('')).toEqual('');
      expect(capWord(' ')).toEqual('');
      expect(capWord(undefined)).toEqual('');
      expect(capWord(null)).toEqual('');
    });

    it('string word(s) input returns trimmed string with capitalized first word', () => {
      expect(capWord('word')).toEqual('Word');
      expect(capWord(' string')).toEqual('String');
      expect(capWord('wonderful!')).toEqual('Wonderful!');
      expect(capWord('hello there!')).toEqual('Hello there!');
    });

    it(`int input returns stringified version of int`, () => {
      expect(capWord(3)).toEqual('3');
      expect(capWord(1234)).toEqual('1234');
    });

    it(`string input with ints as first 'word' returns trimmed string with unchanged chars`, () => {
      expect(capWord('5')).toEqual('5');
      expect(capWord(' 8')).toEqual('8');
      expect(capWord('6 string')).toEqual('6 string');
      expect(capWord(`${8} string`)).toEqual('8 string');
    });
  });

  describe('formatMoney fn', () => {
    it('leaves cents off for whole dollars', () => {
      expect(formatMoney(50)).toEqual('$50');
      expect(formatMoney(1)).toEqual('$1');
      expect(formatMoney(500000)).toEqual('$500,000');
    });

    it('works with whole and fractional dollars', () => {
      expect(formatMoney(.01)).toEqual('$0.01');
      expect(formatMoney(.4)).toEqual('$0.40');
      expect(formatMoney(0.1020)).toEqual('$0.10');
      expect(formatMoney(0.09)).toEqual('$0.09');
      expect(formatMoney(50.12)).toEqual('$50.12');
      expect(formatMoney(1.01)).toEqual('$1.01');
      expect(formatMoney(1.10)).toEqual('$1.10');
    });

    it('works with large whole dollars up to trillion', () => {
      expect(formatMoney(749823749823749)).toEqual('$749,823,749,823,749');
    });

    it('works with large fractional dollars up to trillion', () => {
      expect(formatMoney(749823749823749.2)).toEqual('$749,823,749,823,749.20');
    });

    it('returns rounded numbers larger than trillion', () => {
      expect(formatMoney(20893749823749823749)).toEqual('$20,893,749,823,749,825,000');
    });

    it('works with trailing cents', () => {
      const price = 12.50;
      const quantity = 3;
      const three_shipping = quantity * SHIPPING_COST_PER_ITEM;
      const three_salestax = quantity * price * SALES_TAX_RATE;
      expect(formatMoney(three_shipping)).toEqual('$3.60');
      expect(formatMoney(three_salestax)).toEqual('$3.47');
    });
  });

  describe('getPageTitleProps fn', () => {
    it('renders properly on shop page w/department', () => {
      expect(getPageTitleProps(mockUser, { department: "bottoms" })).toEqual({
        pageLabel: "",
        titles: [{
          href: {
            pathname: "/shop",
            query: { department: "bottoms" }
          },
          label: "Bottoms"
        }]
      });
    });

    it('renders properly on shop page w/department and category', () => {
      expect(getPageTitleProps(mockUser, { department: "bottoms", category: "pants" })).toEqual({
        pageLabel: "",
        titles: [{
          href: {
            pathname: "/shop",
            query: { department: "bottoms" }
          },
          label: "Bottoms"
        }, {
          href: {
            pathname: "/shop",
            query: { department: "bottoms", category: "pants" }
          },
          label: "Pants"
        }]
      });
    });

    it("renders properly when viewing another user's products shop page", () => {
      expect(getPageTitleProps(mockUser, { name: mockUser.name })).toEqual({
        pageLabel: "My Products",
        titles: []
      });
    });

    it("renders properly when viewing another user's products shop page w/category", () => {
      expect(getPageTitleProps(mockUser, {
        name: 'someone else',
        department: "decor"
      })).toEqual({
        pageLabel: capWord('someone else'),
        titles: [{
          href: {
            pathname: "/shop",
            query: { name: 'someone else', department: "decor" }
          },
          label: "Decor"
        }]
      });
    });

    it('renders properly when viewing own products shop page', () => {
      expect(getPageTitleProps(mockUser, { name: mockUser.name })).toEqual({
        pageLabel: "My Products",
        titles: []
      });
    });

    it('renders properly when viewing own products shop page w/category', () => {
      expect(getPageTitleProps(mockUser, {
        name: mockUser.name,
        department: "decor"
      })).toEqual({
        pageLabel: "My Products",
        titles: [{
          href: {
            pathname: "/shop",
            query: { name: mockUser.name, department: "decor" }
          },
          label: "Decor"
        }]
      });
    });
  });

  describe('getFilterProps fn', () => {
    it('no product(s) return empty array for brands/categories/colors/sizes', () => {
      expect(getFilterProps([])).toEqual({
        brands: [],
        categories: [],
        colors: [],
        sizes: []
      });
    });

    it('single product input returns filled array for brands/categories/colors/sizes', () => {
      expect(getFilterProps([mockProduct])).toEqual({
        brands: ["Peggs"],
        categories: ["sport"],
        colors: [],
        sizes: []
      });
    });

    it('multiple products input returns filled array for brands/categories/colors/sizes', () => {
      const otherProduct = {
        id: "cjr06a3sz0cjm0a71kb2wdmbo",
        brand: "Moddurn",
        category: "home",
        department: "decor",
        online: true,
        title: "Modern Wooden Stool",
        description: "Limited Edition stool from the 2018 Fall fashion line.",
        image: mockImage,
        user: mockUser,
        variants: [{ ...mockVariant }],
        __typename: "Product"
      }
      expect(getFilterProps([mockProduct, otherProduct])).toEqual({
        brands: ["Peggs","Moddurn"],
        categories: ["sport","home"],
        colors: ["white"],
        sizes: ["S"]
      });
    });
  });

  describe('getCartTotals fn', () => {
    it('returns cart totals from empty cart', () => {
      const emptyCart = {
        subTotal: 0,
        totalQuantity: 0,
        totalSalesTax: 0,
        totalShipping: 0
      }
      expect(getCartTotals([])).toEqual(emptyCart);
      expect(getCartTotals()).toEqual(emptyCart);
    });
    it('returns cart totals from cart with items', () => {
      expect(getCartTotals([mockCartItem])).toEqual({
        subTotal: 90,
        totalQuantity: 3,
        totalSalesTax: 8.32,
        totalShipping: 3.6
      });
    });
  });

  describe('getUniqKeyVals fn', () => {
    it('gets unique keys values for size', () => {
      expect(getUniqKeyVals([mockVariant], 'size')).toEqual(["S"]);
    });

    it('gets unique keys values for color', () => {
      expect(getUniqKeyVals([mockVariant], 'color')).toEqual(["white"]);
    });
  });

  describe('getFltrdObjs fn', () => {
    it('returns filtered objs for empty filter', () => {
      expect(getFltrdObjs([mockVariant], {})).toEqual([mockVariant]);
    });

    it('returns filtered objs w/filter', () => {
      let varia = { ...mockVariant };
      varia.color = "black";

      expect(getFltrdObjs([mockVariant, varia], { color: "white" })).toEqual([mockVariant]);
    });
  });
});
