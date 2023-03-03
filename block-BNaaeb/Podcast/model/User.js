var mongoose=require('mongoose')
var bcrypt=require('bcrypt')
const { resource } = require('../app')
const Podcast = require('./Podcast')
var Schema=mongoose.Schema


var UserSchema=new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:5},
    city:{type:String},
    isAdmin: { type: Boolean, default: false },
    subcription: { type: String, default: 'Free' },
    PodcastId:[{type:Schema.Types.ObjectId,ref:'Podcast'}]
},{
    timestamps:true
})

UserSchema.pre('save',function(next){
    // this is refer mongoose database and show before from add database
    console.log(this)
    if(this.email === 'ajayrajput9554@gmail.com'){
        this.isAdmin=true
    }
    if(this.password && this.isModified('password')){
        bcrypt.hash(this.password,10,(err,hashed)=>{
            if(err)return next(err)
            this.password=hashed
            return next()
        })
    }else{
        return next()
    }
})

// method

UserSchema.methods.verifyPassword=function(password,cb){
    bcrypt.compare(password, this.password ,(err,result)=>{
        return cb(err,result)
    })
}

var User=mongoose.model('User',UserSchema)
module.exports=User