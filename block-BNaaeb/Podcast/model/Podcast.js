var mongoose=require('mongoose')
var Schema=mongoose.Schema

var PodcastSchema=new Schema({
    title:{type:String,required:true},
    author:{type:String},
    audio:String,
    image:String,
    subcription:{type:String,default:'Free'},
    likes:{type:Number,default:0},
    dislikes:{type:Number,default:0},
    userId:{type:Schema.Types.ObjectId,ref:'User'}
},{
    timestamps:true
})

module.exports=mongoose.model('Podcast',PodcastSchema)