// this function is to catch async function errors in the Express application, 
// so that we dont have to type try and catch for every async function

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}