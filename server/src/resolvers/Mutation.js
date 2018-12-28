const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Mutation = {
  async createUser(parent, args, ctx, info) {
    const data = { ...args };
    data.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser({
      data: {
        ...data,
        password
      }
    }, info);

    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set 1 year JWT token as response cookie token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // User exists?
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`No such user found for email ${email}`);

    // Password correct?
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid Password!');

    return user;
  },
  async createImage(parent, args, ctx, info) {
    const data = { ...args };
    let productId;
    if (args.productId) {
      productId = args.productId;
      delete data.productId;
    }
    delete data.id;

    // Logged in?
    const userId = ctx.request.userId || 'cjpmd6acr4j2c0a422niv2rp1';
    if (!userId) throw new Error('CREATE IMAGE: You must be signed in to create an image.');

    // Existing image?
    const [existingImg] = await ctx.db.query.images({
      where: { ...data }
    }, info);
    if (!!existingImg) return existingImg;

    const createdImage = await ctx.db.mutation.createImage({
      data: {
        ...data,
        user: { connect: { id: userId } }
      }
    }, info);

    if (productId) {
      await ctx.db.mutation.updateProduct({
        where: { id: productId },
        data: {
          image: { connect: { id: createdImage.id }},
          images: { connect: { id: createdImage.id }}
        }
      });
    }

    return createdImage;
  },
  async deleteImage(parent, args, ctx, info) {
    return await ctx.db.mutation.deleteImage({
      where: { id: args.id }
    }, info);
  },
  async createProduct(parent, args, ctx, info) {
    const imageId = args.imageId;
    const data = { ...args };
    delete data.imageId;

    // Logged in?
    const userId = ctx.request.userId || 'cjpmd6acr4j2c0a422niv2rp1';
    if (!userId) throw new Error('CREATE PRODUCT: You must be signed in to create a product.');

    // Existing image?
    const [existingImg] = await ctx.db.query.images({
      where: { id: imageId }
    });
    if (!existingImg) throw new Error(`CREATE PRODUCT: No image found with ID '${imageId}'.`);

    // Create image with known user/image
    return await ctx.db.mutation.createProduct({
      data: {
        ...data,
        user: { connect: { id: userId } },
        image: { connect: { id: imageId } },
        images: { connect: { id: imageId } }
      }
    }, info);
  },
  async updateProduct(parent, args, ctx, info) {
    const productId = args.id;
    const imageId = args.imageId;
    const data = { ...args };
    delete data.id;
    delete data.imageId;

    // Logged in?
    const userId = ctx.request.userId || 'cjpt3pua1earv0a84i37dnhtc';
    if (!userId) throw new Error('UPDATE PRODUCT: You must be signed in to add to a product.');

    // Existing product?
    const [existingProduct] = await ctx.db.query.products({
      where: { id: productId }
    }, `{ id image { id } user { id }}`);
    if (!existingProduct) throw new Error('UPDATE PRODUCT: No product found with that id.');
    if (existingProduct.user.id !== userId) throw new Error('UPDATE PRODUCT: You are not authorized to update this product.');

    // Update w/new image?
    if (existingProduct.image.id !== imageId) {
      const [existingImg] = await ctx.db.query.images({
        where: { id: imageId }
      });
      if (!existingImg) throw new Error(`UPDATE PRODUCT: No image found with ID '${imageId}'.`);

      // Update w/new image. Old image's 'used_by_product' will now become null.
      data.image = { connect: { id: imageId }};
      // Add new image to product.images. Keep old image in products.images for eventual proper deletion during product's CASCADE deletions)
      data.images = { connect: { id: imageId }};

      // Find variants whose image was 'Same as Product Image' (AKA old image)
      const variantsToUpdate = await ctx.db.query.variants({
        where: { image: { id: existingProduct.image.id }}
      });
      if (!!variantsToUpdate.length) {
        // Update found varaint's image to new product Image
        for (let i = 0; i < variantsToUpdate.length; i ++) {
          const id = variantsToUpdate[i].id;
          await ctx.db.mutation.updateVariant({
            where: { id },
            data: {
              image: { connect: { id: imageId }}
            }
          });
        }
      }
    }

    return await ctx.db.mutation.updateProduct({
      where: { id: productId },
      data
    }, info);
  },
  async deleteProduct(parent, args, ctx, info) {
    const where = { id: args.id };

    // Logged in?
    const userId = ctx.request.userId || 'cjpt3pua1earv0a84i37dnhtc';
    if (!userId) throw new Error('DELETE PRODUCT: You must be signed in to delete a product.');

    // Existing product?
    const [existingProduct] = await ctx.db.query.products({ where }, `{ id user { id }}`);
    if (!existingProduct) throw new Error('DELETE PRODUCT: No product found with that id.');
    if (existingProduct.user.id !== userId) throw new Error('DELETE PRODUCT: You are not authorized to delete this product.');

    // TODO: delete cloudinaryImages here too?

    return await ctx.db.mutation.deleteProduct({ where }, info);
  },
  async createProductVariant(parent, args, ctx, info) {
    const data = { ...args };
    const productId = args.productId;
    const imageId = args.imageId;
    delete data.productId;
    delete data.imageId;

    // Logged in?
    const userId = ctx.request.userId || 'cjpuld0oh2eye0923m9cid4w7';
    if (!userId) throw new Error('CREATE SELECTION: You must be signed in to add to a selection to a product.');

    // Existing product?
    const [existingProduct] = await ctx.db.query.products({
      where: { id: productId }
    }, `{ id user { id } images { id } image { id } }`);
    if (!existingProduct) throw new Error(`CREATE SELECTION: Cannot find product with ID '${productId}'.`);
    if (existingProduct.user.id !== userId) throw new Error('CREATE SELECTION: You are not authorized to update this product.');

    // Existing productVariant?
    const [existingProductVariant] = await ctx.db.query.variants({
      where: {
        size: data.size,
        color: data.color,
        product: { id: productId }
      }
    });
    if (!!existingProductVariant) throw new Error(`CREATE SELECTION: A selection with this size and color already exists for this product.`);

    // Existing image?
    const [existingImg] = await ctx.db.query.images({
      where: { id: imageId }
    });
    if (!existingImg) throw new Error(`CREATE SELECTION: No image found with ID '${imageId}'.`);

    // Update product.images with incoming image?
    if (!existingProduct.images.find(img => img.id === `${imageId}`)) {
      await ctx.db.mutation.updateProduct({
        where: { id: productId },
        data: { images: { connect: { id: imageId }}}
      });
    }

    return await ctx.db.mutation.createVariant({
      data: {
        ...data,
        availability: `${data.quantity} in Stock!`,
        image: { connect: { id: imageId }},
        product: { connect: { id: productId }}
      }
    }, info);
  },
  async updateProductVariant(parent, args, ctx, info) {
    const imageId = args.imageId;
    const data = { ...args };
    delete data.imageId;
    delete data.id;

    // Logged in?
    const userId = ctx.request.userId || 'cjpuld0oh2eye0923m9cid4w7';
    if (!userId) throw new Error('UPDATE SELECTION: You must be signed in to add a selection to a product.');

    // Existing productVariant?
    const [existingProductVariant] = await ctx.db.query.variants({
      where: { id: args.id }
    }, `{ id image { id } product { id images { id } user { id }}}`);
    if (!existingProductVariant) throw new Error(`UPDATE SELECTION: No productVariant found with id '${args.id}'.`);
    if (existingProductVariant.product.user.id !== userId) throw new Error('UPDATE SELECTION: You are not authorized to update this selection.');

    // Update image?
    if (existingProductVariant.image.id !== imageId) {
      const existingImg = await ctx.db.query.image({
        where: { id: imageId }
      });
      if (!existingImg) throw new Error(`CREATE SELECTION: No image found with ID '${imageId}'.`);

      data.image = { connect: { id: imageId } };
    }

    // Update product.images with incoming image?
    if (!existingProductVariant.product.images.find(img => img.id === `${imageId}`)) {
      await ctx.db.mutation.updateProduct({
        where: { id: existingProductVariant.product.id },
        data: { images: { connect: { id: imageId }}}
      });
    }

    // Update availability?
    if (data.quantity !== existingProductVariant.quantity) {
      data.availability = `${data.quantity} in Stock!`;
    }

    return await ctx.db.mutation.updateVariant({
      where: { id: existingProductVariant.id },
      data
    }, info);
  },
  async deleteProductVariant(parent, args, ctx, info) {
    const where = { id: args.id };

    // Logged in?
    const userId = ctx.request.userId || 'cjpmd6acr4j2c0a422niv2rp1';
    if (!userId) throw new Error('DELETE SELECTION: You must be signed in to delete a product.');

    // Existing product?
    const productVariant = await ctx.db.query.variant({ where });
    if (!productVariant) throw new Error(`DELETE SELECTION: No selection with ID '${args.id}' found.`)

    return await ctx.db.mutation.deleteVariant({ where }, info);
  }
};

module.exports = Mutation;
