import styled, { keyframes } from 'styled-components'

// const Loading = styled.div`
//   border: 8px solid #f3f3f3;
//   border-radius: 50%;
//   border-top: 8px solid #ddd;
//   border-bottom: 8px solid #ddd;
//   width: 20px;
//   height: 20px;
//   -webkit-animation: spin 2s linear infinite;
//   animation: spin 2s linear infinite;
//   @-webkit-keyframes spin {
//     0% {
//       -webkit-transform: rotate(0deg);
//     }
//     100% {
//       -webkit-transform: rotate(360deg);
//     }
//   }

//   @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(360deg);
//     }
//   }
// `

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Loading = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);

  border-top: 2px solid grey;
  border-right: 2px solid grey;
  border-bottom: 2px solid grey;
  border-left: 4px solid black;
  background: transparent;
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

export default Loading
