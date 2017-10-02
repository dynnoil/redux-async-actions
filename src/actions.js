import fetch from 'isomorphic-fetch';

const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT';
const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT';

const selectSubreddit = (subreddit) => {
    return {
        type: SELECT_SUBREDDIT,
        subreddit
    }
};

const invalidateSubreddit = (subreddit) => {
    return {
        type: INVALIDATE_SUBREDDIT,
        subreddit
    }
};

// network requests
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';

const requestPosts = (subreddit) => {
    return {
        type: REQUEST_POSTS,
        subreddit
    }
};

const receivePosts = (subreddit, json) => {
    return {
        type: RECEIVE_POSTS,
        subreddit,
        posts: json.data.children.map(child => child.data),
        receivedAt: Date.now()
    }
};

const fetchPosts = (subreddit) => {
    return (dispatch) => {
        dispatch(requestPosts(subreddit));
        return fetch(`https://www.reddit.com/r/${subreddit}.json`)
            .then(
            response => response.json(),
            error => console.log('An error occured.', error)
            )
            .then(json => dispatch(receivePosts(subreddit, json)))
    }
};

const shouldFetchPosts = (state, subreddit) => {
    const posts = state.postsBySubreddit[subreddit];
    if (!posts) {
        return true;
    } else if (posts.isFetching) {
        return false;
    } else {
        return posts.didInvalidate;
    }
};

export const fetchPostsIfNeeded = (subreddit) => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.
    // This is useful for avoiding a network request if
    // a cached value is already available.
    return (dispatch, getState) => {
        if (shouldFetchPosts(getState(), subreddit)) {
            // Dispatch a thunk from thunk!
            return dispatch(fetchPosts(subreddit))
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    }
};
