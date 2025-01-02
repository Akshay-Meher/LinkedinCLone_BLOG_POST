function dateFormate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
function dateFormateOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // hour12: true
    });
}

const Handlebars = require('handlebars');

// Register the 'eq' helper
function eq(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
};



module.exports = { dateFormate, dateFormateOnly, eq };