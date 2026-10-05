const User=require("../models/user");


module.exports.renderSignupFrom=(req,res)=>{
    res.render("users/signup.ejs");
}


module.exports.signup=async(req,res)=>{
    try{
    let { username,email,password }= req.body;
    const newUser=new User({email,username});
    const regUser= await User.register(newUser,password);
    console.log(regUser);
    req.login(regUser,(err) => {
        if(err){
            return next(err);
        }
         req.flash("success","welcome To WanderLust");
        res.redirect("/listings");
    });
   
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}


module.exports.renderLoginForm=(req,res) =>{
    res.render("users/login.ejs");
}


module.exports.Login= async(req,res) =>{
            req.flash("success","welcome to wonderLust!");
            let redirectUrl=res.locals.redirectUrl || "/listings" ;
            res.redirect(redirectUrl);

}

module.exports.Logout=(req,res,next) =>{
   req.logout((err) =>{
    if(err){
        return next(err);
    }
    req.flash("success","you are logged out!");
    res.redirect("/listings");
   })
}



