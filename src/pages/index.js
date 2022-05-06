import * as React from "react";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import {
  Container,
  Divider,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import "@fontsource/roboto/400.css";
import styled from "@emotion/styled";
import data from "../../content/papers.json";
import AppBar from "../components/bar";
import { Box } from "@mui/system";

const AuthorText = styled("div")`
  color: #878787;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

function chips(paper) {
  let labels = paper.labels.map((label) => (
    <Chip size="small" label={label} color="primary" />
  ));

  for (const [conf, confObj] of Object.entries(paper.publications)) {
    let text = conf + " " + confObj.year;
    if ("url" in confObj) {
      labels.push(
        <Chip
          size="small"
          label={text}
          color="secondary"
          onClick={() => openInNewTab(confObj.url)}
        />
      );
    } else {
      labels.push(<Chip size="small" label={text} color="secondary" />);
    }
  }

  return labels;
}

function buildListItems(data) {
  return data.map((paper) => (
  <ListItem>
    <ListItemText
      primary={
        <Stack direction="row" spacing={3}>
          <TitleText>{paper.title}</TitleText>
          <AuthorText>{paper.authors.join(", ")}</AuthorText>
          <Stack direction="row" spacing={1}>
            {chips(paper)}
          </Stack>
        </Stack>
      }
    />
  </ListItem>
  ))
}

function minYearOfPaper(paper) {
  const years = Object.values(paper.publications).map((pub) => pub.year)
  return Math.min(...years)
}

const years = data.flatMap((paper) => Object.values(paper.publications).map((pub) => pub.year))
const minYear = Math.min(...years)
const maxYear = Math.max(...years)
const marks = Array.from(new Array(maxYear - minYear + 1), (x, i) => i + minYear).map((year) => ({
  value: year,
  label: year.toString()
}));

function valuetext(value) {
  return value
}

const SORT_YEAR_TOP_DOWN = "Newest first"
const SORT_YEAR_BOTTOM_UP = "Oldest first"
const sortOptions = [SORT_YEAR_BOTTOM_UP, SORT_YEAR_TOP_DOWN]

// markup
const IndexPage = () => {
  const [years, setYears] = React.useState([minYear, maxYear]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  const filteredData = data.filter(p => Object.values(p.publications).some(pub => years[0] <= pub.year && pub.year <= years[1]))
  const sortedData = filteredData.sort(function(p1, p2) {
    if(sort == SORT_YEAR_TOP_DOWN) {
      return minYearOfPaper(p2) - minYearOfPaper(p1)
    } else {
      return minYearOfPaper(p1) - minYearOfPaper(p2)
    }
  })

  const items = buildListItems(sortedData)

  return (
    <div>
      <AppBar />
      <Container maxWidth="None">
          <Stack direction="row" sx={{ p: 1 }} spacing={5} alignItems="center">
            <Box sx={{ width: '30%' }}>
              <Slider
              aria-label="Always visible"
              
              getAriaLabelText={valuetext}
              value={years}
              min={minYear}
              max={maxYear}
              onChange={(event, newValue) => setYears(newValue)}
              valueLabelDisplay="auto"
              marks={marks}
              disableSwap
              />
              </Box>
          
              <Select
              value={sort}
              autoWidth={true}
              label=""
              onChange={handleSort}
              >
                {sortOptions.map((opt) => <MenuItem value={opt}>{opt}</MenuItem>)}
            </Select>
            <Typography>
              {items.length} papers
            </Typography>
          </Stack>
        <Divider></Divider>
        <List dense="true">{items}</List>
      </Container>
    </div>
  );
};

export default IndexPage;
