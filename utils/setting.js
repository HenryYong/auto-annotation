var os = require('os')

module.exports = {
    filename: '',
    time: 'Created @ ',
    copyright: 'Copyright © ' + new Date().getFullYear() + ' by ' + os.userInfo().username + '. All Rights Reserved.'
}
