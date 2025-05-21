const mongoose = require('mongoose');

const args = process.argv.slice(2); 
const password = args[0];

if (!password) {
  console.log('Please provide password as first argument');
  process.exit(1);
}

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

const Contact = mongoose.model('Contact', contactSchema);

const connectDB = async () => {
  const password_encoded = encodeURIComponent(password);
  const url = `mongodb+srv://fullstack:${password_encoded}@cluster0.7vssdi8.mongodb.net/contactsApp?retryWrites=true&w=majority&appName=Cluster0`;
  
  mongoose.set('strictQuery', false);
  
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    return false;
  }
};

const listContacts = async () => {
  try {
    const contacts = await Contact.find({});
    console.log('Phonebook:');
    contacts.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`);
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const addContact = async (name, number) => {
  if (!name || !number) {
    console.error('Both name and number are required');
    return false;
  }
  
  try {
    const contact = new Contact({ name, number });
    await contact.save();
    console.log(`Added ${name} number ${number} to phonebook`);
    return true;
  } catch (error) {
    console.error('Error adding contact:', error.message);
    return false;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const main = async () => {
  const connected = await connectDB();
  if (!connected) return;

  if (args.length === 1) {
    await listContacts();
  } else if (args.length === 3) {
    const name = args[1];
    const number = args[2];
    await addContact(name, number);
  } else {
    console.log('Invalid number of arguments');
    console.log('Usage:');
    console.log('- To list contacts: node app.js <password>');
    console.log('- To add a contact: node app.js <password> <name> <number>');
    await mongoose.connection.close();
  }
};

main().catch(error => {
  console.error('Application error:', error);
  process.exit(1);
});