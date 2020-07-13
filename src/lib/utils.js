/**
 * * Created by lee on 2018/12/11
 */

const dataFilter = data => data;
const validator = function({ id }) {
    // this bind imServer
    this.status.load(id);
    return true;
};

exports.dataFilter = dataFilter;
exports.validator = validator;
