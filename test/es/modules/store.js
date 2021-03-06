import {createStore} from "redux";
import {aryToObject, callFunc, isFunc, isPromise, setDispatch} from "wangct-util";
import history from './history';
import models from '../config/models';

setDispatch(getDispatch());

const store = getStore(models);


export default store;

export function getStore(models){

  const store = createStore((state,action) => {
    const [namespace,funcField] = (action.type || '').split('/');
    const {reducers = {},effects = {}} = models.find(item => item.namespace === namespace) || {};
    const updateState = {};
    if(effects[funcField]){
      const gener = effects[funcField](action,{
        put:put.bind(this,namespace),
        select,
        call
      });
      loopGenerator(gener);
    }

    if(reducers[funcField]){
      updateState[namespace] = reducers[funcField](state[namespace],action);
    }
    return {
      ...state,
      ...updateState
    }
  },aryToObject(models,'namespace',item => item.state))


  function put(namespace,action){
    getDispatch(namespace)(action);
    return Promise.resolve(action);
  }

  function select(func){
    return Promise.resolve(func(store.getState()))
  }

  function call(...args){
    const target = args[0];
    if(isPromise(target)){
      return target;
    }else if(isFunc(target)){
      return target(...args.slice(1));
    }else{
      return Promise.resolve(args);
    }
  }

  models.forEach(({subscriptions,namespace}) => {
    if(subscriptions){
      Object.keys(subscriptions).forEach(key => {
        callFunc(subscriptions[key],{
          dispatch:getDispatch(namespace),
          history
        })
      })
    }
  });
  return store;
}


export function getDispatch(namespace = 'global'){
  return (action) => {
    store.dispatch({
      ...action,
      type:formatType(action.type,namespace)
    })
  }
}

function formatType(type = '',namespace){
  const [typespace,funcField] = type.split('/');
  return funcField ? type : namespace + '/' + typespace
}

function loopGenerator(gener,params){
  const {value,done} = gener.next(params);
  if(!done){
    if(isPromise(value)){
      value.then(data => {
        loopGenerator(gener,data);
      })
    }else{
      loopGenerator(gener,value);
    }
  }
}
