import {
  Box,
  Divider,
  Select,
  Slider,
  Stack,
  Typography,
  Chip,
  ListItem,
  ListItemText,
  List,
  MenuItem,
} from "@mui/material";
import * as React from "react";
import styled from "@emotion/styled";

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};


function chips(paper) {
  let labels =
    "labels" in paper
      ? paper.labels.map((label) => <Chip size="small" label={label} color="primary" />)
      : [];

  for (const pub of paper.publications) {
    let text = pub.name + " " + pub.year;
    if ("url" in pub) {
      labels.push(
        <Chip
          size="small"
          label={text}
          color="secondary"
          onClick={() => openInNewTab(pub.url)}
        />
      );
    } else {
      labels.push(<Chip size="small" label={text} color="secondary" />);
    }
  }

  return labels;
}

const AuthorText = styled("div")`
  color: #878787;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

const buildListItems = (data) => {
  return data.map((paper) => (
    <ListItem>
      <ListItemText
        primary={
          <Stack direction="row" spacing={3}>
            <TitleText>{paper.title}</TitleText>
            <AuthorText>{paper.authors}</AuthorText>
            <Stack direction="row" spacing={1}>
              {chips(paper)}
            </Stack>
          </Stack>
        }
      />
    </ListItem>
  ));
};

function minYearOfPaper(paper) {
  const years = paper.publications.map((pub) => pub.year);
  return Math.min(...years);
}

function valuetext(value) {
  return value;
}

const SORT_YEAR_TOP_DOWN = "Newest first";
const SORT_YEAR_BOTTOM_UP = "Oldest first";
const sortOptions = [SORT_YEAR_BOTTOM_UP, SORT_YEAR_TOP_DOWN];

const PaperList = ({ data }) => {
  const allYears = data.flatMap((paper) =>
    paper.publications.flatMap((pub) => pub.year)
  );
  const allLabels = data.flatMap(paper => paper.labels ? paper.labels : []);
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort();
  console.log(distinctLabels)
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const marks = Array.from(
    new Array(maxYear - minYear + 1),
    (x, i) => i + minYear
  ).map((year) => ({
    value: year,
    label: year.toString(),
  }));

  const [years, setYears] = React.useState([minYear, maxYear]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  const filteredData = data.filter((p) =>
    p.publications.some((pub) => years[0] <= pub.year && pub.year <= years[1])
  );
  const sortedData = filteredData.sort(function (p1, p2) {
    if (sort === SORT_YEAR_TOP_DOWN) {
      return minYearOfPaper(p2) - minYearOfPaper(p1);
    } else {
      return minYearOfPaper(p1) - minYearOfPaper(p2);
    }
  });

  const items = buildListItems(sortedData);

  return (
    <div>
      <Stack direction="row" sx={{ p: 1 }} spacing={5} alignItems="center">
        <Box sx={{ width: "30%" }}>
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

        <Select value={sort} autoWidth={true} label="" onChange={handleSort}>
          {sortOptions.map((opt) => (
            <MenuItem value={opt}>{opt}</MenuItem>
          ))}
        </Select>
        <Typography>{items.length} papers</Typography>
      </Stack>
      <Divider />
      
        <Stack 
          spacing={1} 
          direction={{ xs: 'column', md: 'row' }} 
          alignItems='flex-start'
        >
        <List dense="true">{items}</List>
        <Divider orientation={ 'vertical' } flexItem />
        <Stack pt={1} spacing={1} direction={{ md: 'row', lg: 'column' }}>
          {distinctLabels.map(l => <Chip size="small" label={l} color="primary" />)}
        </Stack>
        </Stack>
    </div>
  );
};

export default PaperList;
