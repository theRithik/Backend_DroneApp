const express = require('express')
const fs = require('fs')
const user = express.Router()
const bodyParser= require('body-parser')
const {MongoClient, Admin, ObjectId} = require('mongodb')
const bcrypt = require('bcrypt')
const fileUpload  = require('express-fileupload');
const jwt = require('jsonwebtoken')
const url ="mongodb+srv://testing:test123@cluster1.vnynuru.mongodb.net/?retryWrites=true&w=majority"
const hidden = require('../config/hidden')

user.use(bodyParser.urlencoded({extended:true}))
user.use(bodyParser.json())
user.use(fileUpload())

const client = new MongoClient(url,{

    useNewUrlParser:true,
    useUnifiedTopology:true
})


user.get('/',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('courses').find().toArray((err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.send(result)
                }
            })
        }
    })
})




user.post('/userRegister',(req,response)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('userDetails').findOne({"user_Email":req.body.Email}, (er,result)=>{
                if(er){
                    console.log(er)
                }
                else{
                if(result){
                    response.status(300).send({auth:false,token:'email already in excists'})
            
                }
                else{
                    const hashedPassword= bcrypt.hashSync(req.body.Password,8)
                    const user={
                        user_Name:req.body.Name,
                        user_Email:req.body.Email,
                        password:hashedPassword,
                        role:'Admin',
                        data_Created:new Date().toISOString().split('T')[0].split('-').reverse().join('-')
                    }
                   
                    db.collection('userDetails').insertOne((user),(err,data)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            response.status(200).send({auth:true,token:'user successfully registerd'})
                        }

                    })
                }
            }
            })
        }
    })
})



user.post('/userLogin',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
    const db = dbres.db('Agmay')
    const email = req.body.email
    const password = req.body.password
    db.collection('userDetails').findOne({"user_Email":email},(err,user)=>{
        if(err){
            console.log(err)
        }
        else{
           
            if(!user){
                
                res.status(300).send({auth:false,token:'No User Found'})
            }
            else{

                const passwordIsValid = bcrypt.compareSync(password,user.password);
                if(!passwordIsValid){
                    res.status(300).send({auth:false,token:'Wrong Password'})
                }
                else{
                    const token = jwt.sign({"name":user.user_Name},hidden.secrete,{})
                    res.status(200).send({auth:true,token:'Successfully Logined',data:token,id:user._id})
                }
            }
        }
    })
        }
    })

})
user.post('/getUser',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db=dbres.db('Agmay')
           
            db.collection('userDetails').find({_id:ObjectId(req.body._id)}).toArray((err,result)=>{
                if(err){
                    console.log(err)
                }
                if(result===[]){
                    res.status(300).send({auth:false,token:'wrong id'})
                }
                else{
                
                    res.status(200).send({auth:true,result})
                }
            })
        }
    })
})




user.post('/details',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('courses').find({_id:ObjectId(req.body._id)}).toArray((err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.send(result)
                }
            })
        }
    })
})

user.put('/postDetails',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            console.log('running')
            db.collection('courses').updateMany({},{$set:{"trainers":[]}},{multi:true},function(err,result){
                if(err){
                    console.log(err)
                }
                else{
                    res.send(result)
                }
            })
        }
    })
})




// user.post('/addImage',(req,res)=>{
//     const imgFile = req.files.image
//     if(imgFile.size>4* 1024 * 1024 ){
//         console.log('cannot upload')

//     }
//     else{
//         res.send({data:imgFile.data})
//     }
// })



// user.post('/addImage',(req,res)=>{
//     const imgFile = req.files.image.data
//     res.send({data:imgFile})
    // client.connect((dberr,dbres)=>{
    //     if(dberr){
    //         console.log(dberr)
    //     }
    //     else{
    //         const db = dbres.db('Agmay')
    //         const imgFile = req.files.image.data
    //         console.log(imgFile)
    //         db.collection('instituteDetails').insertOne({"image":imgFile},(er,result)=>{
    //             if(er){
    //                 console.log(er)
    //             }
    //             else{
    //                 res.send({data:imgFile})
    //             }
    //         })
    //     }
    // })

// })




module.exports=user