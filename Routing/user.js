const express = require('express')
const fs = require('fs')
const user = express.Router()
const bodyParser= require('body-parser')
const {MongoClient, ObjectId} = require('mongodb')
const bcrypt = require('bcrypt')
const fileUpload  = require('express-fileupload');
const jwt = require('jsonwebtoken')
const url ='mongodb+srv://Rithik:Agmay%402022@cluster0.40mtm7p.mongodb.net/?retryWrites=true&w=majority'
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
                        First_Name:req.body.Name,
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
                    res.status(200).send({auth:true,token:'Successfully Logined',data:token,id:user._id,})
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



user.put('/updateUserProfile',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const _id = {"_id":ObjectId(req.body._id)}
            const update = {"First_Name":req.body.fstName,"Last_Name":req.body.lstName,"user_Email":req.body.email,"phone":req.body.phone,"alternate_Phone":req.body.alternate,"DOB":req.body.DOB,"passport":req.body.passport,"aadhaar":req.body.aadhaar,"Address":req.body.paddress,"Alternate_address":req.body.preAddress}
            db.collection('userDetails').update(_id,{$set:update},function(err,result){
                if(err){
                    console.log(err)
                }
                else{
                    console.log(result)
                    res.status(200).send({auth:true,data:result})
                }
            })
        }
    })
})




// user.post('/addImage',(req,res)=>{
//     const imgFile = req.files
//     console.log(imgFile.image.data)
//     console.log(imgFile.image.name)
   
// })



user.put('/addImage',(req,res)=>{

    const imgFile = req.files
    const image = imgFile.image.data
    const id = imgFile.image.name
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const _id = {"_id":ObjectId(id)}
            const query = {"profile_photo":image}
            db.collection('userDetails').updateOne(_id,{$set:query},(er,result)=>{
                if(er){
                    console.log(er)
                }
                else{
                    res.status(200).send({auth:true,data:result})
                }
            })
        }
    })

})


user.post('/addResume',(req,res)=>{
const pdf = req.files
const pdfData = pdf.file.data
const pdfName = pdf.file.name
const id = pdf.id.name
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const name =pdf.name
            db.collection('user_resume').findOne({"id":id},(err,result)=>{
                if(!result){
                    db.collection('user_resume').insertOne({"id":id,"name":pdfName,"resume":pdfData},(err,value)=>{
                        if(err){
                            console.log(er)
                        }
                        else{
                            console.log(value,'insert')
                            res.status(200).send({auth:true,data:value})
                        }

                    })
                }
                else{
                    db.collection('user_resume').updateOne({"id":id},{$set:{"name":pdfName,"resume":pdfData}},(err,data)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log(data,'update')
                            res.status(200).send(data)
                        }
                    })
                }
            })
        }
    })
})



user.post('/otherDoc',(req,res)=>{
    const pdf = req.files
    const pdfData = pdf.file.data
    const pdfName = pdf.file.name
    const id = pdf.id.name
        client.connect((dberr,dbres)=>{
            if(dberr){
                console.log(dberr)
            }
            else{
                const db = dbres.db('Agmay')
                db.collection('user_doc').findOne({"id":id},(err,result)=>{
                    if(!result){
                        db.collection('user_doc').insertOne({"id":id, "doc":[{"name":pdfName,"resume":pdfData}]},(err,value)=>{
                            if(err){
                                console.log(er)
                            }
                            else{
                                console.log(value,'insert')
                                res.status(200).send({auth:true,data:value})
                            }
    
                        })
                    }
                    else{
                        db.collection('user_doc').updateOne({"id":result.id},{$push:{doc:{"name":pdfName,"resume":pdfData}}},(err,data)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log(data,'update')
                                res.status(200).send(data)
                            }
                        })
                    }
                })
            }
        })
    })
    
    
user.post('/getImageBanner',(req,res)=>{
    const id = req.body.id
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('course_banner').find({"id":id}).toArray((er,result)=>{
                if(er){
                    console.log(er)
                }
                else{
                    res.status(200).send(result)
                }
            })
        }
    })

})



    user.post('/getphotoGallery',(req,res)=>{
        client.connect((dberr,dbres)=>{
            if(dberr){
                console.log(dberr)
            }
            else{
                const db = dbres.db('Agmay')    
             const id=req.body.id
                db.collection('courseImage_gallery').find({"id":id}).toArray((er,value)=>{
                    if(er){
                        console.log(er)
                    }
                    else{
                     console.log(value)
                        res.status(200).send(value)
                    }
                })       
 }
        })
 })
 


module.exports=user