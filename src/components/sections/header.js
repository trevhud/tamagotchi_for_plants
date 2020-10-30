import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import {
  select,
  easeLinear,
  max
} from 'd3';

import { Container } from "../global"

let branches = 0
let gamePlays = 0
let timerId

// Tree configuration
const seed = {i: 0, x: 420, y: 600, a: 0, l: 130, d: 0, g: gamePlays }; // a = angle, l = length, d = depth
let speed = 10000
let da = 0.5; // Angle delta
const dl = 0.8; // Length delta (factor)
const ar = 0.7; // Randomness
const maxDepth = 12;

const Header = () => {
  const svgRef = useRef(null);
  const [perfectMode, setPerfectMode] = useState(false);
  const dyingRef = useRef(false)
  dyingRef.current = false
  const pathologies = [changeColor, curlBranches, growthSpeed]
  const pathArray = [false, false, false]

  function leftRightBranch(b, left) {
    const leaf = b.d === maxDepth - 1

    if (b.d === maxDepth) {
      clearInterval(timerId)
      console.log('you win')
      return;
    }

    const end = endPt(b)
    const daR = ar * Math.random() - ar * 0.5;
    const newB = {
      i: branches,
      x: end.x,
      y: end.y,
      a: left ? (b.a - da) : (b.a + da) + daR,
      l: leaf ? 6 : (b.l * dl),
      d: b.d + 1,
      parent: b.i,
      g: b.g
    };
    drawLine(newB);
  }

  function drawLine(branch) {
    branches++

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
      .style('stroke-width', function(d) {
        return (d.d === maxDepth - 1) ? '20px' : parseInt(maxDepth + 1 - d.d) + 'px';
      })
      .style('stroke-linecap', function(d) {
        return (d.d === maxDepth - 1) ? 'round' : 'butt'
      })

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
    console.log('regen')
    curlBranches(true)
    growthSpeed(true)
    clearInterval(timerId)
    if (!perfectMode) startTimer()
    gamePlays += 1
    seed.g = gamePlays
    select(svgRef.current).selectAll('*').remove()
    branches = 0
    drawLine(seed)
  }

  function changeColor(green) {
    select(svgRef.current)
      .selectAll('.line')
      .style('stroke', green ? 'green' : 'yellow')
    pathArray[0] = !green
  }

  function curlBranches(uncurl) {
    da = uncurl ? 0.5 : 2
    pathArray[1] = !uncurl
  }

  function growthSpeed(faster) {
    speed = faster ? 1000 : 5000
    pathArray[2] = !faster
  }

  function startTimer() {
    timerId = setInterval(() => {
      if (pathArray.every(val => val === false)) {
        dyingRef.current = false
        pathologies[Math.floor(Math.random() * pathologies.length)]()
      } else if (!dyingRef.current) {
        dyingRef.current = true
      } else {
        console.log('game over')
        gamePlays = 0
        clearInterval(timerId)
        dyingRef.current = false
      }
    }, 2000)
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
            <div><p>{dyingRef.current ? 'Your plant is dying' : null}</p></div>
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