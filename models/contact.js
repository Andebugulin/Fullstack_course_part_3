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
    required: true,
    minLength: 3,
  },
  number: {
    type: String,
    required: true,
    validate: {
        validator: function(v) {
          return /^\d{3}-\d{5,}$/.test(v) || /^\d{2}-\d{6,}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
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