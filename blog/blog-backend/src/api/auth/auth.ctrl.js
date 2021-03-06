/* 회원 관련 API */
import Joi from '@hapi/joi';
import User from '../../models/user';

/* 회원 가입 : POST /api/auth/register */
// {
//     username: 'velopert',
//     password: 'mypass123'
// }
export const register = async (ctx) => {
    // Request Body 검증하기
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(20).required(),
        password: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { username, password } = ctx.request.body;
    try {
        // username  이 이미 존재하는지 확인
        const exists = await User.findByUsername(username);
        if (exists) {
            ctx.status = 409; // Conflict(이미 존재하는 계정)
            return;
        }

        const user = new User({ username });
        await user.setPassword(password); // 비밀번호 설정(Hashcode - 암호화)
        await user.save(); // 데이터베이스에 저장

        ctx.body = user.serialize();

        const token = user.generateToken();

        /* 생성한 토큰을 cookie에 담아서 사용하는 방식 */
        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly: true,
        });
    } catch (e) {
        ctx.throw(500, e);
    }
};

/* 로그인 : POST /api/auth/login */
// {
//     username: 'velopert',
//     password: 'mypass123'
// }
export const login = async (ctx) => {
    const { username, password } = ctx.request.body;

    // username, password 가 없으면 에러 처리
    if (!username || !password) {
        if (!username) {
            ctx.status = 600; // 아이디를 입력해주세요
            return;
        }
        if (!password) {
            ctx.status = 601; // 비밀번호를 입력해주세요
            return;
        }
    }

    try {
        const user = await User.findByUsername(username);
        // 계정이 존재하지 않으면 에러 처리
        if (!user) {
            ctx.status = 602;
            return;
        }
        const valid = await user.checkPassword(password);
        // 잘못된 비밀번호
        if (!valid) {
            ctx.status = 603;
            return;
        }
        ctx.body = user.serialize();

        const token = user.generateToken();

        /* 생성한 토큰을 cookie에 담아서 사용하는 방식 */
        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly: true,
        });
    } catch (e) {
        ctx.throw(500, e);
    }
};

/* 회원 정보 체크 : GET /api/auth/check */
export const check = async (ctx) => {
    const { user } = ctx.state;
    if (!user) {
        ctx.status = 401;
        return;
    }
    ctx.body = user;
};

/* 로그아웃 : POST /api/auth/logut */
export const logout = async (ctx) => {
    ctx.cookies.set('access_token'); //기존 cookie 삭제
    ctx.status = 204; //No Content
};
