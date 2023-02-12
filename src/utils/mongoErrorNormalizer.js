exports.normalize = (generalMessage, err) => {
    let error = {};

    if (err.name == 'ValidationError') {

        error.message = generalMessage;
        error.errors = {};

        const keys = Object.keys(err.errors);

        keys.forEach(key => {

            if (err.errors[key].properties) {

                error.errors[key] = err.errors[key].properties.message;

            } else {

                error.errors[key] = 'Invalid data type';

            }

        });

    } else {

        error.message = err.name;
    }

    return error
}