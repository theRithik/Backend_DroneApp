const express = require('express')
const fs = require('fs')
const admin = express.Router()
const bodyParser= require('body-parser')
const {MongoClient, ObjectId} = require('mongodb')
const bcrypt = require('bcrypt')
const hidden = require('../config/hidden')
const url ="mongodb+srv://testing:test123@cluster1.vnynuru.mongodb.net/?retryWrites=true&w=majority"
const jwt = require('jsonwebtoken')


admin.use(bodyParser.urlencoded({extended:true}))
admin.use(bodyParser.json())

const token = ''
const client = new MongoClient(url,{

    useNewUrlParser:true,
    useUnifiedTopology:true
})



admin.post('/addCourse',(req,res)=>{
    const date = new Date().toISOString().split('T')[0].split('-').reverse().join('-')
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const courseData={
                "id":JSON.parse(req.body.id),
                "institute_name":req.body.institute_name,
                "course":req.body.course,
                "fees":req.body.fees,
                "state":req.body.state,
                "city":req.body.city,
                "address":req.body.address,
                "startDate":req.body.date,
                "display_image":req.body.image,
                "courseDuration":req.body.courseDuration,
      "droneType":req.body.droneType,
      "droneCategory":req.body.droneCategory,
      "date":date
            }

            db.collection('courses').insertOne(courseData,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.status(200).send(result)
                    console.log(result)
                }
            })
        }
    })
})


admin.put('/updateCourse',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const id = JSON.parse(req.body.id)
            const userToken = req.body.token
            if(!userToken) return res.status(300).send({auth:false, token:'your are not authorized invalid token'})

            jwt.verify(userToken,hidden.secrete,(err,data)=>{
                if(err) return res.status(300).send({auth:false,token:"invalid token provided"})
                else{
            db.collection('courses').findOne({"id":id},(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    if(!result){
                        res.status(300).send({auth:false,token:'wrong course id entered'})
                    }
                    else{
                       const updateField={}
                        const query1 = {"id":id}
                        if(req.body.CourseName!==undefined&&req.body.CourseName!==''){
                           updateField.course  = req.body.CourseName
                        }
                        else{
                             updateField.course = result.course
                        }
                        if(req.body.fees!==undefined && req.body.fees!==''){
                            updateField.fees=req.body.fees
                        }
                        else{
                            updateField.fees=result.fees
                        }
                        if(req.body.discount!==undefined && req.body.discount!==''){
                            updateField.discount=req.body.discount
                        }
                        else{
                            updateField.discount=result.discount
                        }
                        if(req.body.image!==undefined && req.body.image!==''){
                            updateField.display_image=req.body.image
                        }
                        else{
                            updateField.display_image=result.display_image
                        }
                        if(req.body.courseDuration!==undefined && req.body.courseDuration!==''){
                            updateField.courseDuration=req.body.courseDuration
                        }
                        else{
                            updateField.courseDuration=result.courseDuration
                        }
                        db.collection('courses').updateOne(query1,{$set:updateField},function(err,data){
                            if(err){
                                console.log(err)
                            }
                            else{
                                res.status(200).send(data)
                                console.log(data)
                            }
                        })
                    }
                }
            })
           
        }
    })
}
    })
})




admin.post('/Register',(req,response)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('instituteDetails').findOne({"Institute_Email":req.body.Email}, (er,result)=>{
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
                        Name:req.body.name,
                        Institute_Name:req.body.InstName,
                        Institute_Email:req.body.Email,
                        Password:hashedPassword,
                        data_Created:new Date().toISOString().split('T')[0].split('-').reverse().join('-')
                    }
                   
                    db.collection('instituteDetails').insertOne((user),(err,data)=>{
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


admin.post('/instCheck',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
    const db = dbres.db('Agmay')
    db.collection('instituteDetails').findOne({"Institute_Name":req.body.institute_Name},(er,result)=>{
        if(er){
            console.log(er)
        }
        else{
            if(result===null){
                console.log(result)
                res.status(200).send({auth:true,data:'you can use the name'})
               
            }
            else{
               
                console.log('result')
                res.status(300).send({auth:false,data:'instititue already in use'})
            }
        
        }
    })
}
})
})


admin.post('/instituteLogin',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
    const db = dbres.db('Agmay')
    const email = req.body.email
    const password = req.body.password
    db.collection('instituteDetails').findOne({"Institute_Email":email},(err,user)=>{
        if(err){
            console.log(err)
        }
        else{
            if(!user){
                
                res.status(300).send({auth:false,token:'No User Found'})
            }
            else{
                const passwordIsValid = bcrypt.compareSync(password,user.Password);
                if(!passwordIsValid){
                    res.status(300).send({auth:false,token:'Wrong Password'})
                }
                else{
                    const token = jwt.sign({"name":user.Institute_Name},hidden.secrete,{})
                    res.status(200).send({auth:true,token:'Successfully Logined',data:token,id:user._id})
                }
            }
        }
    })
        }
    })

})


admin.post('/addTrainer',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const query1 = {"id":62}
            const query2 = {"trainer_Name":req.body.tname,"trainer_Experience":req.body.tExp,"trainer_Category":req.body.topt,"trainer_Dscribtion":req.body.desc}
            const db = dbres.db('Agmay')

            db.collection('courses').updateOne(query1,{$push:{trainers:query2}},(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.status(200).send({auth:true,data:result})
                }
            })

        }
    })

})


admin.post('/ADetails',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('instituteDetails').findOne({_id:ObjectId(req.body.id)},(err,result)=>{
                if(err){
                    res.status(300).send({auth:false,token:err})
                }
                else{
                    res.status(200).send({auth:true,token:'successfull',data:result})
                }

            })


        }
    })
})



module.exports =admin