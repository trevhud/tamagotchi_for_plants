import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import {
  select,
  easeLinear
} from 'd3';

import { Container } from "../global"

let branches = []
let gamePlays = 0
let timerIds = []

// Tree configuration
const seed = {i: 0, x: 420, y: 600, a: 0, l: 130, d: 0, g: gamePlays }; // a = angle, l = length, d = depth
let speed = 4000
let da = 0.5; // Angle delta
const dl = 0.8; // Length delta (factor)
const ar = 0.7; // Randomness
const maxDepth = 10;

const Header = () => {
  const svgRef = useRef(null);
  const [perfectMode, setPerfectMode] = useState(false);
  const pathologies = [changeColor, curlBranches, growthSpeed]

  function leftRightBranch(b, left) {
    if (b.d === maxDepth) {
      clearTimers()
      return;
    }

    const end = endPt(b)
    const daR = ar * Math.random() - ar * 0.5;
    const newB = {
      i: branches.length,
      x: end.x,
      y: end.y,
      a: left ? (b.a - da) : (b.a + da) + daR,
      l: b.l * dl,
      d: b.d + 1,
      parent: b.i,
      g: b.g
    };
    drawLine(newB);
  }

  function drawLine(branch) {
    branches.push(branch)

    let line = select(svgRef.current)
      .append('line')
      .datum(branch)
      .attr('id', 'line' + branch.i)
      .attr('class', 'line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .style('stroke', 'green')
      .style('stroke-width', function(d) {return parseInt(maxDepth + 1 - d.d) + 'px';})

    let totalLength = line.node().getTotalLength()

    line.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      
    line.transition()
      .duration(speed)
      .ease(easeLinear)
      .attr("stroke-dashoffset", 0)
      .on('end', () => {
        if (branch.g === gamePlays) {
          leftRightBranch(branch, true)
          leftRightBranch(branch)
        }
      })
  }

  function regenerate() {
    console.log(timerIds, perfectMode, gamePlays)
    curlBranches(true)
    growthSpeed(true)
    clearTimers()
    if (!perfectMode) startTimer()
    gamePlays += 1
    seed.g = gamePlays
    select(svgRef.current).selectAll('*').remove()
    branches = []
    drawLine(seed)
  }

  function clearTimers() {
    timerIds.forEach(timerId => {
      clearInterval(timerId)
    })
  }

  function changeColor(green) {
    select(svgRef.current)
      .selectAll('.line')
      .style('stroke', green ? 'green' : 'yellow')
  }

  function curlBranches(uncurl) {
    da = uncurl ? 0.5 : 2
  }

  function growthSpeed(faster) {
    speed = faster ? 5000 : 20000
  }

  function startTimer() {
    let timerId = setInterval(() => pathologies[Math.floor(Math.random() * pathologies.length)](), 5000)
    timerIds.push(timerId);
    console.log('start timer', timerIds)
  }

  useEffect(regenerate,[perfectMode]);

  return (
    <HeaderWrapper id="top">
      <Container>
        <Flex>
          <div><svg height="600px" width="100%" ref={svgRef} /></div>
          <ActionsContainer>
            <button onClick={() => curlBranches(true)}>Add water</button>
            <button onClick={() => changeColor(true)}>Add nutrients</button>
            <button onClick={() => growthSpeed(true)}>Add light</button>
            <button onClick={() => setPerfectMode(!perfectMode)} className={perfectMode ? 'toggled' : null}>Perfect mode</button>
            <button onClick={regenerate}>Regenerate</button>
          </ActionsContainer>
        </Flex>
      </Container>
    </HeaderWrapper>
  )
}

export default Header

function endPt(b) {
  // Return endpoint of branch
  const x = b.x + b.l * Math.sin( b.a );
  const y = b.y - b.l * Math.cos( b.a );
  return {x: x, y: y};
}

// D3 functions
function x1(d) {return d.x;}
function y1(d) {return d.y;}
function x2(d) {return endPt(d).x;}
function y2(d) {return endPt(d).y;}

const HeaderWrapper = styled.header`
  background-color: #f8f8f8;
  padding: 160px 0 80px 0;
  position: relative;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 5vw));
  @media (max-width: ${props => props.theme.screen.md}) {
  }
`

const Flex = styled.div`
  display: grid;
  justify-content: space-between;
  align-content: center;
  grid-template-columns: 850px 1fr;
  @media (max-width: ${props => props.theme.screen.md}) {
    grid-template-columns: 1fr;
    grid-gap: 64px;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: ${props => props.theme.screen.xs}) {
    display: none;
  }

  button {
    font-family: ${props => props.theme.font.normal};
    ${props => props.theme.font_size.xsmall};
    color: white;
    background: #098b8c;
    border-radius: 4px;
    padding: 10px 16px;
    text-transform: uppercase;
    font-size: 12px;
      &.toggled {
        background: green;
      }
  }
`