import React, { useRef, useEffect } from "react"
import styled from "styled-components"
import { select, easeLinear } from 'd3'
import { Container } from "../global"

// Tree configuration
const speed = 1000
const angleDelta = 0.5
const lengthDelta = 0.8
const randomness = 0.7
const maxDepth = 10

const Header = () => {
  // useRef allows us to always have access to the svg
  const svgRef = useRef(null)
  const seed = { x: 420, y: 600, angle: 0, length: 130, depth: 0 }

  const regenerate = () => {
    // Remove the old one and draw the line
    select(svgRef.current).selectAll('*').remove()
    drawLine(seed)
  }

  const drawLine = (branch) => {
    // Draw the line using its corresponding data
    const line = select(svgRef.current)
      .append('line')
      .datum(branch)
      .attr('class', 'line')
      .attr('x1', (d) => d.x)
      .attr('y1', (d) => d.y)
      .attr('x2', (d) => endPoint(d).x)
      .attr('y2', (d) => endPoint(d).y)
      .style('stroke', (d) => isLeaf(d) ? 'green' : 'saddleBrown')
      .style('stroke-linecap', (d) => isLeaf(d) ? 'round' : 'butt' )
      .style('stroke-width', (d) => {
        return isLeaf(d) ? '10px' : parseInt(maxDepth + 1 - d.depth) + 'px'
      })

    animateLine(branch, line)
  }

  const animateLine = (branch, line) => {
    // The line is drawn already, the following code animates it like it's growing
    // When it is done being drawn, it kicks off a new branch
    const totalLength = line.node().getTotalLength()

    line.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      
    line.transition()
      .duration(speed)
      .ease(easeLinear)
      .attr("stroke-dashoffset", 0)
      .on('end', () => {
        makeNewBranch(branch, true)
        makeNewBranch(branch)
      })
  }

  const makeNewBranch = (branch, left) => {
    // Make a new branch, left or right depending on the second parameter
    if (isLeaf(branch)) return

    const end = endPoint(branch)
    const angleDeltaRandom = randomness * Math.random() - randomness * 0.5;

    const newBranch = {
      x: end.x,
      y: end.y,
      angle: left ? (branch.angle - angleDelta) : (branch.angle + angleDelta) + angleDeltaRandom,
      length: isLeaf(branch) ? 2 : (branch.length * lengthDelta),
      depth: branch.depth + 1
    };
    drawLine(newBranch);
  }

  const isLeaf = (branch) => {
    // Return whether it is the last set of elements drawn
    return branch.depth === maxDepth
  }

  const endPoint = (branch) => {
    // Return endpoint of branch
    return {
      x: branch.x + branch.length * Math.sin( branch.angle ),
      y: branch.y - branch.length * Math.cos( branch.angle )
    }
  }

  useEffect(regenerate)

  return (
    <HeaderWrapper id="top">
      <Container>
        <Flex>
          <div><svg height="600px" width="100%" ref={svgRef} /></div>
          <ActionsContainer>
            <button onClick={regenerate}>Regenerate</button>
          </ActionsContainer>
        </Flex>
      </Container>
    </HeaderWrapper>
  )
}

export default Header

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