let state = {
    
    spreadsheets: [
        // { id, name }
    ],

    sheets: [
        // { id, name }
    ],
    
    ready: false,

},

view = {

    get(id) {
        return document.getElementById(id)
    },

    update(items) {
        for (let id in items) {
            let el = this.get(id),
            data = items[id]
            switch (el.nodeName) {
                case 'INPUT':
                    el.value = data
                    break
                case 'SELECT':
                    el.options.length = 0
                    data.forEach( item => el.options.add(new Option(item.name, item.id)) )
                    break
                case 'DIV':
                    el.innerHTML = data
            }
        }
    },

    show(id) {
        this.get(id).style.display = 'inline'
        return this
    },

    hide(id) {
        this.get(id).style.display = 'none'
        return this
    },

    enable(id) {
        view.get(id).disabled = false
        return this
    },

    accept(e) {
        if (state.ready && e.keyCode == 13) this.submit()
    },
    
    submit() {
        let item = this.get('item').value,
        qty = this.get('qty').value,
        image = Quagga.canvas.dom.image,
        result = document.createElement('div')
        result.setAttribute('class','thumbnail')
        result.innerHTML = "<img src='"+image.toDataURL()+"'/><h3>"+item+": "+qty+"</h3>"
        this.get('results').prepend(result)
        this.update({ info: 'RESULTS' })

        let params = {
            spreadsheetId: this.get('spreadsheets').value, 
            range: this.get('sheets').selectedOptions[0].text + '!A:C',
            valueInputOption: 'RAW',  
            insertDataOption: 'INSERT_ROWS', 
        },

        valueRangeBody = {
            values: [[ new Date().toLocaleDateString(), item, qty ]]
        }
    
        gapi.client.sheets.spreadsheets.values
        .append(params, valueRangeBody)
        .then( response => {
            console.log('Append new row:.....done.')
        }, reason => {
            alert('Error: ' + reason.result.error.message)
        })

        this.back()
    },

    back() {
        history.back()
        this.hide('popup').show('scanner')
        Quagga.start()
    }

},

scanner = {
    init() {
        Quagga.init(this.config, function(err) {
            if (err) alert(err)
                else Quagga.start()
        })
    },

    config: {
        inputStream: {
            type : 'LiveStream',
            constraints: {
                width: 480,
                height: 480,
                facingMode: 'environment',
                aspectRatio: {min: 1, max: 2}
            },

            area: { 
                top: '30%',    // top offset
                right: '10%',  // right offset
                left: '10%',   // left offset
                bottom: '30%'  // bottom offset
            } 
        },

        locator: {
            patchSize: 'large',
            halfSample: true
        },

        numOfWorkers: 2,
        frequency: 10,

        decoder: {
            readers : [{
                format: 'code_128_reader',
                config: {}
            }],
            multiple: false
        },

        locate: true,
        multiple: false
    },

    lastResult: null
}

Quagga.onDetected( result => {
    scanner.lastResult = result.codeResult.code
    console.log('Barcode:', scanner.lastResult)
    Quagga.pause()

    view
    .hide('scanner')
    .show('popup')
    .update({
        item: scanner.lastResult,
        qty: ''
    })

    setTimeout(() => { 
        view.get('qty').focus() 
    }, 500)

    history.pushState(null, null)
})

scanner.init()
