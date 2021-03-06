import { call, put } from 'redux-saga/effects';

export const createPromiseSaga = (type, promiseCreator) => {
    const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
    return function* saga(action) {
        try {
            const result = yield call(promiseCreator, action.payload); //promiseCreator : promise를 만들어주는 함수
            yield put({
                type: SUCCESS,
                payload: result,
            });
        } catch (e) {
            yield put({
                type: ERROR,
                error: true,
                payload: e,
            });
        }
    };
};

export const createPromiseSagaById = (type, promiseCreator) => {
    const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
    return function* saga(action) {
        const id = action.meta; // 성공 or 실패 했을때 meta값으로 id를 전달함
        try {
            const result = yield call(promiseCreator, action.payload); //promiseCreator : promise를 만들어주는 함수
            yield put({
                type: SUCCESS,
                payload: result,
                meta: id,
            });
        } catch (e) {
            yield put({
                type: ERROR,
                error: true,
                payload: e,
                meta: id,
            });
        }
    };
};

/* reducer에서 사용 할 수 있는 여러 유틸 함수 선언 */
export const reducerUtils = {
    // 초기 상태. 초기 data 값은 기본적으로 null 이지만 바꿀 수도 있습니다.
    initial: (initialData = null) => ({
        loading: false,
        data: initialData,
        error: null,
    }),
    // 로딩중 상태 - prevState의 경우엔 기본값은 null 이지만, 따로 값을 지정하면 null 로 바꾸지 않고 다른 값을 유지시킬 수 있습니다.
    loading: (prevState = null) => ({
        loading: true,
        data: prevState,
        error: null,
    }),
    // 성공 상태
    success: (payload) => ({
        loading: false,
        data: payload,
        error: null,
    }),
    // 실패 상태
    error: (error) => ({
        loading: false,
        data: null,
        error: error,
    }),
};

/* 비동기 관련 3가지 액션들을 처리하는 reducer
 * type - 액션의 타입,
 * key - 상태의 key (ex. posts, post) */
export const handleAsyncActions = (type, key, keepData) => {
    const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
    return (state, action) => {
        switch (action.type) {
            case type:
                return {
                    ...state,
                    [key]: reducerUtils.loading(
                        keepData ? state[key].data : null
                    ), //handleAsyncActions의 3번째 값을 true로 받아 온다면 기존의 상태값을 유지하겠다라는 의미(false면 null 처리)
                };
            case SUCCESS:
                return {
                    ...state,
                    [key]: reducerUtils.success(action.payload),
                };
            case ERROR:
                return {
                    ...state,
                    [key]: reducerUtils.error(action.payload),
                };
            default:
                return state;
        }
    };
};

export const handleAsyncActionsById = (type, key, keepData) => {
    const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
    return (state, action) => {
        const id = action.meta;
        switch (action.type) {
            case type:
                return {
                    ...state,
                    [key]: {
                        ...state[key],
                        [id]: reducerUtils.loading(
                            keepData
                                ? state[key][id] && state[key][id].data //읽어오고자 하는 state[key][id]값이 undefined면 null 처리됨
                                : null
                        ),
                    },
                };
            case SUCCESS:
                return {
                    ...state,
                    [key]: {
                        ...state[key],
                        [id]: reducerUtils.success(action.payload),
                    },
                };
            case ERROR:
                return {
                    ...state,
                    [key]: {
                        ...state[key],
                        [id]: reducerUtils.error(action.payload),
                    },
                };
            default:
                return state;
        }
    };
};
