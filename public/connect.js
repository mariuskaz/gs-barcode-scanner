let connect = function () {

	gapi.load('client:auth2', () => {
		console.log('Loading client auth...')
		gapi.client.init({
			// Replace with your own API credentials from Google Cloud Platform
			apiKey: 'AIzaSyBg6TafQeM6mjdAgRi5hh2G1k9gAdxUkqA',
			clientId: '549665734442-bc7pqd84f27s5rrl8j8e3sgrej0gfh9s.apps.googleusercontent.com',

			discoveryDocs: [
				'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
				'https://sheets.googleapis.com/$discovery/rest?version=v4'
			],
			
			scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',

		}).then(() => {
			let client = gapi.auth2.getAuthInstance()
			signed = client.isSignedIn.get()

			if (signed) {
				getSpreadSheets(signed)
				
			} else {
				client.signIn().then(
					client.isSignedIn.listen(getSpreadSheets)
				)
			}

		})

  	})
},

getSpreadSheets = function (signed) {

	if (signed) {

		gapi.client.drive.files.list({
			'q': 'mimeType="application/vnd.google-apps.spreadsheet"',
			'pageSize': 100,
			'fields': 'nextPageToken, files(id, name)'

		}).then(response => {
			let files = response.result.files
			console.log('Spreadsheets on Drive: ' + files.length)
			state.spreadsheets = []
			state.spreadsheets.push({ id: 'none', name: 'Choose spreadsheet' })
			if (files && files.length > 0) {
				files.forEach(file => state.spreadsheets.push({ id: file.id, name: file.name }))
				view.update({ spreadsheets: state.spreadsheets })
			}
			
		})

	}

},

getSheets = function () {

    gapi.client.sheets.spreadsheets.get({
		spreadsheetId: view.get('spreadsheets').value
		
    }).then( response => {
		let sheets = response.result.sheets
		console.log('Sheets in spreadsheet:', sheets.length)
		state.sheets = []
		if (sheets && sheets.length > 0) {
			sheets.forEach(sheet => {
				state.sheets.push({ id: sheet.properties.index, name: sheet.properties.title } )
			})
			view.update({ sheets: state.sheets })
			view.show('sheets').enable('submit')
			state.ready = true
		}
    })

}