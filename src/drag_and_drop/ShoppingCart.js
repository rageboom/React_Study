import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';
import {DropTarget} from 'react-dnd';

// ShoppingCart 드래그 앤 드롭 사양
// "드롭 대상 사양을 구현하는 일반 객체"
//
//  - DropTarget 메서드 (모두 선택적)
//  - drop: 호환되는 항목이 드롭되면 호출된다.
//  - hover: 항목으로 컴포넌트를 가리키면 호출된다.
//  - canDrop: 드롭 대상이 항목을 수락할 수 있는지 여부를
//  지정하는 데 이용된다.
const ShoppingCartSpec = {
    drop() {
        return {name: 'ShoppingCart'};
    }
};

// ShoppingCart DropTarget - collect
// 콜랙팅 함수
//
let collect = (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

class ShoppingCart extends Component {
    render() {
        const {canDrop, isOver, connectDropTarget} = this.props;
        const isActive = canDrop && isOver;

        let backgroundColor = '#ffffff';

        if (isActive) {
            backgroundColor = '#f7f7bd';
        } else if (canDrop) {
            backgroundColor = '#f7f7f7';
        }

        const style = {
            backgroundColor: '#ffffff'
        };

        return connectDropTarget(
            <div className='shopping-cart' style={style}>
                {isActive ?
                    'Hummm, snack!':
                    'Drag here to order!'
                }
            </div>
        );
    }
}

ShoppingCart.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver           : PropTypes.bool.isRequired,
    canDrop          : PropTypes.bool.isRequired
}

export default DropTarget("snack", ShoppingCartSpec, collect)(ShoppingCart);
