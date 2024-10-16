
require ('dotenv').config();
const express = require('express');
const connectToDataBase = require('./Database/index.js');
const Blog = require('./model/blogModel.js');



const app = express();
app.use(express.json())
const {multer, storage} = require('./middleware/multerConfig.js')

const upload = multer({storage : storage})
const fs = require('fs');


connectToDataBase();
// Define routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: "This is the home page"
    });
});

app.post('/blog', upload.single('image') ,async(req, res) => {
// const title = req.body.title
// const subtitle = req.body.subtitle
// const description = req.body.description
// const image = req.body.image

console.log(req.body);
console.log(req.file);

const filename = req.file.filename;


const {title, subtitle, description} = req.body
const image = req.file

if(!title || !description || !image || !subtitle){

    return res.status(400).json({
        message:"Please provide all data"
    })
}

try {
    await Blog.create({
        title : title,
        subtitle : subtitle,
        description : description,
        image : filename
     
         
     })
     
} catch (error) {
    
    if (error.code === 11000) {
        return res.status(400).json({
            message: "Blog title already exists. Please choose a different title."
        });
    }

}

res.status(200).json({
    message : "Blog successful"
})

})

app.get("/blog", async(req, res)=>{

 const blogs = await Blog.find() //returns data in array
  
 res.status(200).json ({

message : 'Blog fetched successfully',
data : blogs

 })
})


app.get("/blog/:id", async(req, res)=>{

const id = req.params.id;
 const blog = await Blog.findById(id); //object
if (!blog) {
    
   return res.status(404).json({
        message: "No data found"
    })
}
else{

 res.status(200).json({

    message : "fetched successfully",
    data : blog
 })

}
})

app.delete("/blog/:id", async(req,res)=>{

   const id = req.params.id

   await Blog.findByIdAndDelete(id)
   fs.unlink('storage/a.png', (err)=>{
    
    if(err){

        console.log(err);
    }
    else{
        console.log('file deleted');
    }

   })    

   res.status(200).json({

message : "Blog deleted sucessfully"

   })
})


app.patch('/blog/:id', async(req,res)=>{
const id = req.params.id 
const {title, subtitle, description} = req.body
 await Blog.findByIdAndUpdate(id, {

    title : title,
    subtitle : subtitle,
    description : description
})
res.status(200).json({

    message : "Blog updated successfully"
})


})

// Start the server
app.listen(process.env.PORT, () => {
    console.log("Server running on port 5000");
});
