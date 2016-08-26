import React, {Component} from 'react';
import update from 'react-addons-update';
import {throttle} from './utils';
import KanbanBoard from './KanbanBoard';
// 폴리필
import 'babel-polyfill';
import 'whatwg-fetch';

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
    'Content-Type': 'application/json',
    Authorization : 'any-string-you-like'//localhost 라면 필요없음.
};

class KanbanBoardContainer extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            cards: [],
        };
        // 인수가 변경된 경우에만 updateCardStatus를 호출한다.
        this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
        // 최대 500ms마다(또는 인수가 변경된 경우) updateCardPosition을 호출한다.
        this.updateCardPosition = throttle(this.updateCardPosition.bind(this), 500);
    }

    componentDidMount() {
        fetch(API_URL+'/cards', {headers: API_HEADERS})
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({cards: responseData})
        })
        .catch((error) => {
            console.log('error !!!', error)
        });
    }

    addTask(cardId, taskName) {
        //낙관적인 UI 변경을 되돌려야 하는 경우를 대비해
        //변경하기 전 원래 상태에 대한 참도를 저장한다.
        let prevState = this.state;
        //fild the index of the cardId
        let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
        //지정한 이름과 임시 ID로 새로운 태스크를 생성한다.
        let newTask = {id: Date.now(), name: taskName, done: false};
        //새로운 객체를 생성하고 태스크의 배열로 새로운 태스크를 푸시한다.
        let nextState = update(this.state.cards, {
            [cardIndex]: {
                tasks: {$push: [newTask]}
            }
        });

        //변경된 객체로 컴포넌트 상태를 설정한다.
        this.setState({cards: nextState});

        //API를 호출해 서버에 해당 태스크를 추가한다.
        fetch(`${API_URL}/cards/${cardId}/tasks`, {
            method : 'post',
            headers: API_HEADERS,
            body   : JSON.stringify(newTask)
        })
        .then((response) => {
            if(response.ok) {
                return response.json()
            } else {
                //서버 응답이 정상이 아닌 경우
                //오류를 생성해 UI에 대한 낙관적인 변경을
                //원래대로 되돌린다.
                throw new ("Server response wasn't OK")
            }
        })
        .then((responseData) => {
            //서버가 새로운 태스크를 추가하는 데 이용한
            //확정 ID를 변환하면 리액트에서 ID를 업데이트 한다.
            newTask.id = responseData.id;
            this.setState({cards: nextState});
        })
        .catch((error) => {
            this.setState(prevState);
        });
    }

    addCard(card) {
        // 낙관적인 UI 변경을 되돌려야 하는 경우를 대비해
        // 변경하기 전 원래 상태에 대한 참조를 저장한다.
        let prevState = this.state;

        //카드에 임시 ID를 부여한다.
        if (card.id === null) {
            let card = Object.assign({}, card, {id: Date.now()});
        }

        //새로운 객체를 생성하고 카드의 배열로 새로운 카드를 푸시한다.
        let nextState = update(this.state.cards, {$push: [card]});

        //변경된 객체로 컴포넌트 상태를 설정한다.
        this.setState({cards: nextState});

        //API를 호출해 서버에 카드를 추가한다.
        fetch(`${API_URL}/cards`, {
            method: 'post',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        })
        .then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                // 서버 응답이 정상이 아닌 경우
                // 오류를 생성해 UI에 대한 낙관적인 변경을
                // 원래대로 되돌린다.
                throw new Error("Server response wasn't OK");
            }
        })
        .then((responseData) => {
            // 서버가 새로운 카드를 추가하는 데 이용한
            // 확정 ID를 반환하면 리액트에서 ID를 업데이트 한다.
            card.id = responseData.id;
            this.setState({cards: nextState});
        })
        .catch((error) => {
            this.setState(prevState);
        });
    }

    updateCard(card) {
        // 낙관적인 UI 변경을 되돌려야 하는 경우를 대비해
        // 변경하기 전 원래 상태에 대한 참조를 저장한다.
        let prevState = this.state;

        //카드에 인덱스를 찾는다.
        let cardIndex = this.state.cards.findIndex((c)=>c.id == card.id);

        // $set 명령을 이용해 카드 전체를 변경한다.
        let nextState = update(this.state.cards, {
            [cardIndex]: {$set: card}
        });

        //변경된 객체로 컴포넌트 상태를 설정한다.
        this.setState({cards: nextState});

        //API를 호출해 서버에 카드를 추가한다.
        fetch(`${API_URL}/cards/${card.id}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        })
        .then((response) => {
            if(response.ok) {
                // 서버 응답이 정상이 아닌 경우
                // 오류를 생성해 UI에 대한 낙관적인 변경을
                // 원래대로 되돌린다.
                throw new Error("Server response wasn't OK")
            }
        })
        .catch((error) => {
            console.error("Fetch error: ", error)
            this.setState(prevState);
        });
    }

    deleteTask(cardId, taskId, taskIndex) {
        //카드의 인덱스를 찾는다.
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        //변경하기 전 원래 상태에 대한 참조를 저장한다.
        let prevState = this.state;
        //해당 태스크를 제외한 새로운 객체를 생성한다.
        let nextState = update(this.state.cards, {
            [cardIndex]: {
                tasks: {
                    $splice: [[taskIndex, 1]]
                }
            }
        });

        //변경된 객체로 컴포넌트 상태를 설정한다.
        this.setState({cards: nextState});

        //API를 호출해 서버에서 해당 태스크를 제거한다.
        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method : 'delete',
            headers: API_HEADERS
        })
        .then((response) => {
            if(!response.ok) {
                //서버 응답이 정상이 아닌 경우
                //오류를 생성해 UI에 대한 낙관적인 변경을
                //원래대로 되돌린다.
                throw new Error("Server response wasn't OK")
            }
        })
        .catch((error) => {
            console.error("Fetch error:", error)
            this.setState(prevState);
        });
    }

    toggleTask(cardId, taskId, taskIndex) {
        //낙관적인 UI 변경을 되돌려야 하는 경우를 대비해
        //변경하기 전 원래 상태에 대한 참조를 저장한다.
        let prevState = this.state;

        //카드의 인덱스를 찾는다.
        let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
        //태스크의 'done' 값에 대한 참조를 저장한다.
        let newDoneValue;
        //$apply명령을 이용해 done 값을 현재와 반대로 변경한다.
        let nextState = update(
            this.state.cards, {
                [cardIndex]: {
                    tasks: {
                        [taskIndex]: {
                            done: {$apply: (done) => {
                                newDoneValue = !done
                                return newDoneValue;
                            }
                        }
                    }
                }
            }
        });

        //변경된 객체로 컴포넌트 상태를 설정한다.
        this.setState({cards: nextState});

        //API를 호출햇 서버에서 해당 태스크를 토글한다.
        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({done: newDoneValue})
        })
        .then((response) => {
            if (!response.ok) {
                //서버응답이 정상이 아닌경우
                //오류를 생성해 UI에 대한 낙관적인 변경을
                //원래대로 되돌린다.
                throw new Error("Server response wasn't OK")
            }
        })
        .catch((error) => {
            console.error("Fetch error:", error)
            this.setState(prevState);
        });
    }

    updateCardStatus(cardId, listId) {
        // 카드의 인덱스를 찾는다.
        let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
        // 현재 카드를 얻는다.
        let card = this.state.cards[cardIndex]
        // 다른 리스트 위로 드래그할 때만 진행한다.
        if (card.status !== listId) {
            // 변경된 객체로 컴포넌트 상태를 설정한다.
            this.setState(update(this.state, {
                cards: {
                    [cardIndex]: {
                        status: {$set: listId}
                    }
                }
            }));
        }
    }

    updateCardPosition(cardId, afterId) {
        // 다른 카드 위로 드래그할 때만 진행한다.
        if (cardId !== afterId) {
            // 카드의 인덱스를 찾는다.
            let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
            // 현재 카드를 얻는다.
            let card = this.state.cards[cardIndex]
            // 마우스로 가리키는 카드의 인덱스를 찾는다.
            let afterIndex = this.state.cards.findIndex((card)=>card.id == afterId);
            // splice를 이용해 카드를 제거한 후 새로운 인덱스 위치로 삽입힌다.
            this.setState(update(this.state, {
                cards: {
                    $splice: [
                        [cardIndex, 1],
                        [afterIndex, 0, card]
                    ]
                }
            }));
        }
    }

    persistCardDrag(cardId, status) {
        // 카드의 인덱스를 찾는다.
        let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
        // 현재 카드를 얻는다.
        let card = this.state.cards[cardIndex]

        fetch(`${API_URL}/card/${cardId}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({status: card.status, row_order_position: cardIndex})
        })
        .then((response) => {
            if(!response.ok){
                throw new Error("Server response wasn't OK")
            }
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            this.setState(
                update(this.state, {
                    cards: {
                        [cardIndex]: {
                            status: { $set: status}
                        }
                    }
                })
            );
        });
    }

    render() {
        let kanbanBoard = this.props.children && React.cloneElement(
            this.props.children, {
                cards: this.state.cards,
                taskCallbacks: {
                    toggle: this.toggleTask.bind(this),
                    delete: this.deleteTask.bind(this),
                    add   : this.addTask.bind(this)
                },
                cardCallbacks: {
                    addCard: this.addCard.bind(this),
                    updateCard: this.updateCard.bind(this),
                    updateStatus  : this.updateCardStatus.bind(this),
                    updatePosition: throttle(this.updateCardPosition.bind(this), 500),
                    persistCardDrag: this.persistCardMove.bind(this)
                }
            }
        );

        return kanbanBoard;
    }
}

export default KanbanBoardContainer;
