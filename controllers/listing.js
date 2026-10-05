// in this file implement MVC (model,view,controllers)

const Listing= require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index=async (req,res)=>{
    const allListing= await Listing.find({});
    res.render("listing/index",{allListing});
}

module.exports.renderNewForm=(req,res) =>{
    res.render("listing/new");
     
}

module.exports.shoeListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" },}).populate("owner");

    if (!listing) {
        req.flash("error","Listing Requested for does not exit");
        
        return res.redirect("/listings");
    }
     
    //  console.log(listing);    // for show the listing                                                                                                                                                                
    res.render("listing/show.ejs", { listing });
}

module.exports.createListing=async(req,res,next)=>{
    
    let response=await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();
    


    
    
    

        // if(!req.body.listing){
        //     throw new ExpressError(400,"send valid data");
        // }
let url=req.file.path;
let filename= req.file.filename;

    const newListing= new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};

    newListing.geometry=response.body.features[0].geometry;
                                                                                                                 
  let savedListing= await newListing.save();
console.log(savedListing);

   req.flash("success","New Listing Created");
   res.redirect("/listings");
}
// render
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing Requested for does not exit");
        return res.redirect("/listings");
    }
let origanalImageUrl=listing.image.url;
origanalImageUrl= origanalImageUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listing/edit",{listing, origanalImageUrl});
}


// module.exports.updateListing=async (req,res)=>{
//     let {id} =req.params;
//     let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
   
//     if(typeof req.file ){
//         let url=req.file.path;
//         let filename=req.file.filename;
//     listing.image={url,filename};
//    await listing.save();

//     }
   
//     req.flash("success","Updated Listings");
//     res.redirect(`/listings/${id}`);
// }
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Safely check if a new image was uploaded
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Updated Listing");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing= async (req,res)=>{
    let{id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}  

