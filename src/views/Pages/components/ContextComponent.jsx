import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import d3Tip from "d3-tip";
import { useMemo } from "react";
import "./styles/ContextComponent.css";

const ContextComponent = (props) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ width: 500, height: 400 });

  const [filteredWords, setFilteredWords] = useState([]);
  const sentimentColorMap = {
    neutral: "#6c757d",
    positive: "#008000",
    negative: "#c00",
  };
  useEffect(() => {
    if (!props.data || props.data.length === 0) return;

    const filteredData =
      props.type && props.type !== "all"
        ? props.data.filter((d) => d.dominant_sentiment === props.type)
        : props.data;

    const maxMentions = Math.max(
      ...filteredData.map((item) => item.total_mentions)
    );
    const maxSize = 50;

    const mapped = filteredData.map((item) => ({
      text: item.hashtag,
      size: Math.round((item.total_mentions / maxMentions) * maxSize),
      color: sentimentColorMap[item.dominant_sentiment] || "#6c757d",
      mentions: item.total_mentions,
    }));

    setFilteredWords(mapped);
  }, [props.data, props.type]);

  useEffect(() => {
    // Resize observer to handle responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width: width || 500, height: height || 400 });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height || filteredWords.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const layout = cloud()
      .size([size.width, size.height])
      .words(filteredWords.map((d) => ({ ...d, size: d.size })))
      .padding(10)
      .rotate(() => 0)
      .fontSize((d) => d.size)
      .spiral("rectangular")
      .on("end", draw);

    layout.start();

    function draw(words) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", size.width)
        .attr("height", size.height)
        .append("g")
        .attr("transform", `translate(${size.width / 2}, ${size.height / 2})`);

      const tip = d3Tip()
        .attr("class", "d3-tip")
        .html((d) => `<strong>${d.text}</strong>: ${d.mentions} mentions`);
      svg.call(tip);

      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (d) => d.color)
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .text((d) => d.text)
        .on("mouseover", function (event, d) {
          tip.show(d, this);
        })
        .on("mouseout", tip.hide);
    }
  }, [size, filteredWords]);
  if (filteredWords.length === 0) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: "400px", textAlign: "center" }}
      ></div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "400px", textAlign: "center" }}
    >
      <svg ref={svgRef}></svg>
      <style>
        {`
          .d3-tip {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px;
            border-radius: 4px;
            font-size: 14px;
          }
        `}
      </style>
    </div>
  );
};

export default ContextComponent;
