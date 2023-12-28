const express = require("express");
const cartsRepo =require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate= require("../views/carts/show");

const router =express.Router();

router.post("/cart/products",async (req,res)=>{

//kartı anlamak
let cart;
if(!req.session.cartId){
    cart = await cartsRepo.create({items: [] });
    req.session.cartId = cart.id;
}else{
 cart = await cartsRepo.getOne(req.session.cartId);
}
console.log(cart);

const existingItem = cart.items.find(item=>item.id===req.body.productId);
if(existingItem){
    //quantitiy
    existingItem.quantity++;
}else{
    cart.items.push({id:req.body.productId,quantity:1})
}
await cartsRepo.update(cart.id,{
    items:cart.items
});
res.redirect("/cart");
});

router.get("/cart",async (req,res)=>{
    if(!req.session.cartId){
        return res.redirect("/");
    }
    const cart = await cartsRepo.getOne(req.session.cartId);

    if (cart && cart.items) {
    for (let item of cart.items) {
      const product = await productsRepo.getOne(item.id);
      item.product = product;
    }
    res.send(cartShowTemplate({ items: cart.items }));
  } 
});
router.post("/cart/products/delete", async(req,res)=>{
const {itemId} =req.body;
const cart =await cartsRepo.getOne(req.session.cartId);

const items =cart.items.filter(item=> item.id !==itemId);
 await cartsRepo.update(req.session.cartId,{items:items});
 res.redirect("/cart");
});

module.exports=router;
