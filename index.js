const express = require('express')
const morgan = require('morgan')
const app = express()
require('dotenv').config()

const Contact = require('./models/contact')


app.use(express.json())
app.use(express.static('dist'))

// Use morgan middleware with 'tiny' configuration for logging
app.use(morgan('tiny'))

morgan.token('postData', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return '-'
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res, next) => {
  Contact.find({}).then(contacts => {
    res.json(contacts)
  }).catch(error => {
    console.error('Error fetching contacts:', error.message)
    next(error)
  }
  )
})

app.get('/info', (req, res) => {
  const amount_of_people = Contact.length // Get the number of people in the phonebook
  const currentTime = new Date().toLocaleTimeString() // Get current time

  const message = `
        <div>
            <p>
                Phonebook has info for ${amount_of_people} people
            </p>
            <p>
                Request received at: ${currentTime}
            </p>
        </div>
    `
  res.send(message)
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Contact({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      console.error('Error saving contact:', error.message)
      next(error)
    })
}
)

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }
  ).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => {
      console.error('Error deleting contact:', error.message)
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const id = request.params.id
  const updatedContact = {
    name,
    number
  }
  Contact.findByIdAndUpdate(id, updatedContact, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.error('Error updating contact:', error.message)
      next(error)
    })
}
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)



const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })

  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})