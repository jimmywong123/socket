/* */ 
'use strict';

/**
 * @static
 * Returns true if the given region is valid, false otherwise.
 * @param  {Region} region The region to check
 * @return {Boolean}        True, if the region is valid, false otherwise.
 * A region is valid if
 *  * left <= right  &&
 *  * top  <= bottom
 */
module.exports = function validate(region){

    var isValid = true

    if (region.right < region.left){
        isValid = false
        region.right = region.left
    }

    if (region.bottom < region.top){
        isValid = false
        region.bottom = region.top
    }

    return isValid
}