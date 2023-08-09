const express = require('express')
const fs = require('fs')
const admin = express.Router()
const bodyParser= require('body-parser')
const {MongoClient, ObjectId} = require('mongodb')
const bcrypt = require('bcrypt')
const hidden = require('../config/hidden')
const url ='mongodb+srv://Rithik:Agmay%402022@cluster0.40mtm7p.mongodb.net/?retryWrites=true&w=majority'
const jwt = require('jsonwebtoken')
const fileUpload  = require('express-fileupload');


admin.use(bodyParser.urlencoded({extended:true}))
admin.use(bodyParser.json())
admin.use(fileUpload())

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
                "id":Math.floor(Date.now() + Math.random()),
                "Institute_id":req.body.Institute_id,
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
      "description":req.body.description,
      "date":date
            }

            db.collection('courses').insertOne(courseData,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.status(200).send(result)
                }
            })
        }
    })
})



admin.put('/CourseaddImage',(req,res)=>{
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
            const query = {"display_image":image}
            db.collection('courses').updateOne(_id,{$set:query},(er,result)=>{
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


admin.put('/addImageBanner',(req,res)=>{
    const imgFile = req.files
    const image = imgFile.image.data
    const id = imgFile.image.name
    const add ={
        "id":id,
        "banner_image":image
    }
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')    
           db.collection('course_banner').findOne({"id":id},(err,result)=>{
         if(!result){
            db.collection('course_banner').insertOne(add,(er,value)=>{
                if(er){
                    console.log(er)
                }
                else{
                    console.log(value,'insert')
                    res.status(200).send({auth:true,data:value})
                }
            })
                    
                }
                else{
                    const query2= { "banner_image":image}
                    db.collection('course_banner').updateOne({"id":result.id},{$set:query2},(err,data)=>{
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

admin.post('/getUser',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('instituteDetails').findOne({"Institute_Email":req.body.email},(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.status(200).send(result)
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
            const id = ObjectId(req.body._id)
            const userToken = req.body.token
            if(!userToken) return res.status(300).send({auth:false, token:'your are not authorized invalid token'})

            jwt.verify(userToken,hidden.secrete,(err,data)=>{
                if(err) return res.status(300).send({auth:false,token:"invalid token provided"})
                else{
            db.collection('courses').findOne({"_id":id},(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    if(!result){
                        res.status(300).send({auth:false,token:'An error occured'})
                    }
                    else{
                       const updateField={}
                        const query1 = {"_id":id}
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


admin.post('/findCourse',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            db.collection('courses').find({"Institute_id":req.body.Institute_id}).toArray((err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    if(result===[]){
                        res.status(300).send("You haven't added any course ")
                    }
                    else{
                        res.status(200).send(result)
                    }
                    
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
                            const token = jwt.sign({"name":user.Institute_Name},hidden.secrete,{})
                            response.status(200).send({auth:true,token:'user successfully registerd',result:data,dataToken:token})
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
            const query1 = {"_id":ObjectId(req.body.id)}
             var date = new Date().toISOString().split('T')[1].split(':')[2].split('.')[0]
             Number(date)
            const tid =JSON.parse(req.body.tid)+date
            const query2 = {"tid":tid,"trainer_Name":req.body.tname,"trainer_Experience":req.body.tExp,"trainer_Category":req.body.topt,"trainer_Description":req.body.desc}
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



admin.put('/addSyllabus',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const query1 = {"_id":ObjectId(req.body.id)}
            const query2 = {"syllabus":req.body.syllabus}
            const db = dbres.db('Agmay')

            db.collection('courses').updateOne(query1,{$set:query2},(err,result)=>{
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



admin.put('/updateAdminDetails',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const data2 = {"_id":ObjectId(req.body._id)}
            const data = {"Name":req.body.Name,"Institute_Email":req.body.Institute_Email,"alternative_Email":req.body.alternative_Email,"phone_Number":req.body.Phone_number,"Address":req.body.Address,"Branch_Address":req.body.branch_address}
            db.collection('instituteDetails').updateOne(data2,{$set:data},function(err,result){
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

admin.put('/category',(req,res)=>{
    client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
            const data2 = {"_id":ObjectId(req.body._id)}
            const query = {"category":req.body.category,"category_types":req.body.category_types}

            db.collection('instituteDetails').updateOne(data2,{$set:query},function(err,result){
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

admin.post('/photoGallery',(req,res)=>{
    
    const imgFile = req.files
    const arr =[]
    const id =imgFile.name.name
     for(let i=0; i<imgFile.image.length;i++){
        let obj={}
        obj['id']=i
        obj[i]="image"+i
        obj['image']=imgFile.image[i].data
arr.push(obj)
     }
     
     client.connect((dberr,dbres)=>{
        if(dberr){
            console.log(dberr)
        }
        else{
            const db = dbres.db('Agmay')
        db.collection('courseImage_gallery').findOne({"id":id},(err,result)=>{
                if(!result){
                   db.collection('courseImage_gallery').insertOne({"id":id,"gallery":arr},(er,value)=>{
                       if(er){
                           console.log(er)
                       }
                       else{

                           res.status(200).send({auth:true,data:value})
                       }
                   })       
                       }
                       else{
                           db.collection('courseImage_gallery').updateOne({"id":result.id},{$push:{"gallery":{$each:arr}}},(err,data)=>{
                               if(err){
                                   console.log(err)
                               }
                               else{
                                  
                                   res.status(200).send(data)
                               }
                           })
                       }
                    })
                }
            })
    })




    admin.post('/image12',(req,res)=>{
        const img = req.files
        console.log(img)
        res.send(img.foo)
    })


module.exports =admin