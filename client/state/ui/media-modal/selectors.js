import 'calypso/state/ui/init';

/**
 * Returns the current media modal view.
 *
 *
 *
 * @see ./constants.js (MediaView)
 * @param {Object}    state Global state tree
 * @returns {any}       Current media view
 */
export function getMediaModalView( state ) {
	return state.ui.mediaModal.view;
}
