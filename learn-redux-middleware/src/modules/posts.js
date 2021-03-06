import * as postsAPI from '../api/posts'; // api/posts 안의 함수 모두 불러오기
import {
    handleAsyncActions,
    handleAsyncActionsById,
    reducerUtils,
    createPromiseSaga,
    createPromiseSagaById,
} from '../lib/asyncUtils';
import { getContext, takeEvery, select } from 'redux-saga/effects';

/* <프로미스를 다루는 리덕스 모듈을 다룰 땐 다음과 같은 사항을 고려해야함>
 * 1. 프로미스가 시작, 성공, 실패했을때 다른 액션을 디스패치해야합니다.
 * 2. 각 프로미스마다 thunk 함수를 만들어주어야 합니다.
 * 3. 리듀서에서 액션에 따라 로딩중, 결과, 에러 상태를 변경해주어야 합니다. */

/* 액션 타입 - 각 api당 액션 3개씩 선언 (요청 시작/ 성공/ 실패) */

/* #_1 포스트 여러개 조회하기 */
const GET_POSTS = 'GET_POSTS';
const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS';
const GET_POSTS_ERROR = 'GET_POSTS_ERROR';

/* #_2 포스트 하나 조회하기 */
const GET_POST = 'GET_POST';
const GET_POST_SUCCESS = 'GET_POST_SUCCESS';
const GET_POST_ERROR = 'GET_POST_ERROR';

/* 이전의 특정 page로 이동하기위한 액션 */
const GO_TO_HOME = 'GO_TO_HOME';

/* post page에서 벗어날때 기존의 post를 초기화 시켜주는 action 선언 - 다른 post를 요청할때 기존의 post값이 화면에 보여지는걸 방지할 수 있음*/
const CLEAR_POST = 'CLEAR_POST';

/* saga에서 현재 redux-store가 지니고 있는 상태를 조회하는 액션*/
const PRINT_STATE = 'PRINT_STATE';

/* 액션 생성 함수 */
export const getPosts = () => ({ type: GET_POSTS });
export const getPost = (id) => ({
    type: GET_POST,
    payload: id, //saga에서 API를 호출할때 사용할 parameter
    meta: id, //reducer애서 처리할때 사용할 parameter
});
export const printState = () => ({ type: PRINT_STATE });

/* saga 함수 작성 */
const getPostsSaga = createPromiseSaga(GET_POSTS, postsAPI.getPosts);
const getPostSaga = createPromiseSagaById(GET_POST, postsAPI.getPostById);

/* 이전 page로 돌아가능 saga 함수 작성
 * saga 내부에서 history를 사용할 일이 있다면, saga-middleware를 만드는 과정에서 context에 history를 등록해서 사용할 수 있음*/
function* goToHomeSaga() {
    const history = yield getContext('history'); //indexedDB.js에서 history란 이름으로 customHistory를 등록해줌
    history.push('/');
}

function* printStateSaga() {
    /* state값을 받아와서 state의 posts를 조회함 */
    const state = yield select((state) => state.posts);
    console.log(state);
}

/* action들을 모니터링하는 saga 작성 */
export function* postsSaga() {
    yield takeEvery(GET_POSTS, getPostsSaga);
    yield takeEvery(GET_POST, getPostSaga);
    yield takeEvery(GO_TO_HOME, goToHomeSaga);
    yield takeEvery(PRINT_STATE, printStateSaga);
}

export const clearPost = () => ({ type: CLEAR_POST });

/* redux - thunk때와는 다르게 순수 액션 객체를 반환함 */
export const goToHome = () => ({ type: GO_TO_HOME });

/* Home으로 이동하는 thunk 함수 생성 */
// export const goToHome = () => (dispatch, getState, { history }) => {
//     history.push('/');
// };

const initialState = {
    posts: reducerUtils.initial(),
    post: {},
};

/* modules/asyncUtils 컴포넌트의 모듈화 reducer
 * 세번째 파라미터 => ture or false (asynce의 keepData 값)
 * keepData가 true라면 loading중이여도 data값을 초기화하지 않겠다라는 의미 = 기존 data를 재사용하겠다 */
const getPostsReducer = handleAsyncActions(GET_POSTS, 'posts', true);
const getPostReducer = handleAsyncActionsById(GET_POST, 'post', true);

/* 해당 action들을 처리해줄 reducer 선언 - getPostsReducer / getPostReducer */
export default function posts(state = initialState, action) {
    switch (action.type) {
        case GET_POSTS:
        case GET_POSTS_SUCCESS:
        case GET_POSTS_ERROR:
            return getPostsReducer(state, action);
        case GET_POST:
        case GET_POST_SUCCESS:
        case GET_POST_ERROR:
            return getPostReducer(state, action);
        case CLEAR_POST:
            return {
                ...state,
                post: reducerUtils.initial(),
            };
        default:
            return state;
    }
}
