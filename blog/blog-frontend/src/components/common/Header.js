import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Responsive from './Responsive';
import Button from './Button';

/* Header Component가 항상 page 상단에 위치할 수 있도록 position 값을 fixed로 설정
 * 다음 content와 겹치지 않게 Spacer로 위치를 4rem 낮춰줌 */
const HeaderBlock = styled.div`
    position: fixed;
    width: 100%;
    background: white;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
    z-index: 1;
`;

/* Responsive 컴포넌트의 속성에 스타일을 추가해서 새로운 컴포넌트 생성 */
const Wrapper = styled(Responsive)`
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 자식 엘리먼트 사이에 여백을 최대로 설정 */
    .logo {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: 2px;
    }
    .right {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
    }
`;

/* 헤더가 fixed로 되어 있기 때문에 페이지의 컨텐츠가 4rem 아래 나타나도록 해주는 컴포넌트 */
const Spacer = styled.div`
    height: 6rem;
`;

const UserInfo = styled.div`
    font-weight: 800;
    margin-right: 2rem;
`;

const ButtonWithAuth = styled(Button)`
    font-size: 1.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
`;

const Header = ({ user, onLogout }) => {
    return (
        <>
            <HeaderBlock>
                <Wrapper>
                    <Link to="/" className="logo">
                        REACTERS
                    </Link>
                    {/* user값이 props를 통해 주어지는 경우 username과 Logout Button을 보여줌 */}
                    {user ? (
                        <div className="right">
                            <UserInfo>{user.username}</UserInfo>
                            <ButtonWithAuth onClick={onLogout}>
                                로그아웃
                            </ButtonWithAuth>
                        </div>
                    ) : (
                        <div className="right">
                            <ButtonWithAuth to="/login">로그인</ButtonWithAuth>
                        </div>
                    )}
                </Wrapper>
            </HeaderBlock>
            <Spacer />
        </>
    );
};

export default Header;
