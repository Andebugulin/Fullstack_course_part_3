const mongoose = require('mongoose')


mongoose.set('strictQuery', false)


const connectDB = () => {
    const password = process.env.MONGODB_PASSWORD;
    const url = process.env.MONGODB_URI.replace('${MONGODB_PASSWORD}', encodeURIComponent(password));
    
    mongoose.set('strictQuery', false);
    
    mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })
  };
  
  connectDB()



const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  }
});
contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Contact', contactSchema)