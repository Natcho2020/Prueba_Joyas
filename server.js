const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()

app.listen(3000, () => console.log('Your app listening on port 3000'))

// Congelamos joyas del arreglo de joyas para evitar que los metodos lo modifiquen 
joyas.results.map(joya => Object.freeze(joya))

app.get('/', (req, res) => {
  res.send('Oh wow! this is working =)')
})

// localhost:3000/joyas?order=asc | desc
// localhost:3000/joyas?fields=id,name,model,value
// localhost:3000/joyas?limit=3&offset=4
app.get("/joyas", (req, res) => {
  const queryString = req.query
  // caso fields (campos) -> filtrar campos
  if (queryString.fields) {
    //Split divide 
    const fields = queryString.fields.split(",")
    const joyasRespuesta = filtrarCampos(joyas.results, fields)

    res.send(joyasRespuesta)
  }//order como query String* 
  else if (queryString.order == 'asc' || queryString.order == 'desc') {
    const order = queryString.order
    const joyasOrdenadas = ordenarJoyas(joyas.results, order)

    res.send(joyasOrdenadas)
  } else if (queryString.limit && queryString.offset) {
    const cantidadJoyas = joyas.results.length
    const joyasPorPagina = queryString.limit
    const joyaPartida = queryString.offset
    const cantidadPaginas = Math.ceil(Number(cantidadJoyas) / Number(joyasPorPagina))

    const joyasPaginadas = paginador(joyas.results, joyaPartida, joyasPorPagina)

    res.json({
      cantidadPaginas: cantidadPaginas,
      joyas: joyasPaginadas
    })
  } else {
    const joyasRespuesta = HATEOAS(joyas.results)
    res.send(joyasRespuesta)
  }
})

///joyas/id(2,3,etc)
app.get("/joyas/:id", (req, res) => {
  const { id } = req.params
  const joyaResultado = joyas.results.filter(joya => joya.id == id)
  if (joyaResultado.length) {
    res.send(joyaResultado)
  } else {
    res.status(404).json({
      message: 'Record not found',
      status: 404
    })
  }
})

//joyas/categoria/:categoria
app.get("/joyas/categoria/:categoria", (req, res) => {
  const { categoria } = req.params
  const joyaResultado = joyas.results.filter(joya => joya.category == categoria)
  if (joyaResultado.length) {
    res.send(joyaResultado)
  } else {
    res.status(404).json({
      message: 'Record not found',
      status: 404
    })
  }
})

//Parametro joyas
function HATEOAS(joyas) {
  const joyasHATEOAS = joyas.map(joya => {
    const joyaMapeada = {
      name: joya.name,
      url: `http://localhost:3000/joyas/${joya.id}`
    }

    return joyaMapeada
  })

  return joyasHATEOAS
}

///joyas?fields=id,name,model,value
function filtrarCampos(joyas, arregloCampos) {
  // arreglo = [id, name, model, value]

  const joyasFiltradas = joyas.map(joya => {
    const joyaFiltrada = {}

    for (let propiedad in joya) {
      if (arregloCampos.includes(propiedad)) {
        joyaFiltrada[propiedad] = joya[propiedad]
      }
    }

    return joyaFiltrada
  })

  return joyasFiltradas
}

// localhost:3000/joyas?order=asc | desc
function ordenarJoyas(joyas, orden) {
  // const variable = caso_verdad : caso_falso
  // opciones de orden = asc | des
  const joyasOrdenadas = orden == 'asc'
    ? joyas.sort((joya1, joya2) => joya1.value - joya2.value)
    : orden == 'desc' ? joyas.sort((joya1, joya2) => joya2.value - joya1.value) : false
  return joyasOrdenadas
}

function paginador(joyas, offset, limit) {
  const paginaJoyas = joyas.slice(offset, offset + limit)

  return paginaJoyas
}