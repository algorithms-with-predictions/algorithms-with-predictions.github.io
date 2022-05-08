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
  Button,
} from "@mui/material";
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from 'prop-types';

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

const AuthorText = styled("div")`
  color: #878787;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

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
  const allLabels = data.flatMap((paper) => (paper.labels ? paper.labels : []));
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort();
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  const [years, setYears] = React.useState([minYear, maxYear]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);
  const [selLabels, setSelLabels] = React.useState([]);

  const paperChips = (paper) => {
    const labels = "labels" in paper ? paper.labels : [];
    let pubs = paper.publications;
    pubs.sort(function (a, b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    let chips = paper.publications.map((pub) => {
      let text = pub.name + " '" + pub.year.toString().slice(-2);

      return (
        <Chip
          size="small"
          label={text}
          key={text}
          variant={"arXiv" === pub.name ? "outlined" : "filled"}
          color="secondary"
          onClick={() => ("url" in pub ? openInNewTab(pub.url) : {})}
        />
      );
    });

    chips = chips.concat(
      labels.map((label) => (
        <Chip
          size="small"
          key={label}
          label={label}
          color="primary"
          onClick={() => setSelLabels([label, ...selLabels])}
        />
      ))
    );

    return chips;
  };

  const buildListItems = (data) => {
    return data.map((paper, i) => (
      <ListItem key={i}>
        <ListItemText
          primary={
            <Stack direction="row" spacing={3}>
              <TitleText>{paper.title}</TitleText>
              <AuthorText>{paper.authors}</AuthorText>
              <Stack direction="row" spacing={1}>
                {paperChips(paper)}
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    ));
  };

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  const filteredData = data
    .filter((p) =>
      p.publications.some((pub) => years[0] <= pub.year && pub.year <= years[1])
    )
    .filter(
      (p) =>
        selLabels.length === 0 || p.labels.some((l) => selLabels.includes(l))
    );
  const sortedData = filteredData.sort(function (p1, p2) {
    if (sort === SORT_YEAR_TOP_DOWN) {
      return minYearOfPaper(p2) - minYearOfPaper(p1);
    } else {
      return minYearOfPaper(p1) - minYearOfPaper(p2);
    }
  });

  const items = buildListItems(sortedData);
  const marks = Array.from(
    new Array(maxYear - minYear + 1),
    (x, i) => i + minYear
  ).map((year) => ({
    value: year,
    label: year.toString(),
  }));

  return (
    <div>
      <Stack
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Stack
          direction="row"
          p={1}
          spacing={2}
          alignItems="center"
          justifyContent={"flex-start"}
        >
          <Box sx={{ width: 300, pr: 2 }}>
            <Slider
              getAriaLabelText={valuetext}
              value={years}
              min={minYear}
              max={maxYear}
              onChange={(_, newValue) => setYears(newValue)}
              valueLabelDisplay="auto"
              marks={marks}
              disableSwap
            />
          </Box>
          <Select value={sort} autoWidth={true} onChange={handleSort}>
            {sortOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Typography>{items.length} papers</Typography>
        </Stack>
        {selLabels.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setSelLabels([])}
          >
            Reset
          </Button>
        )}
      </Stack>
      <Divider />
      <Stack
        spacing={1}
        direction={{ xs: "column-reverse", md: "row" }}
        alignItems="stretch"
        justifyContent={"space-between"}
      >
        <List dense="true">{items}</List>
        <Box sx={{ display: "flex" }}>
          <Divider orientation={"vertical"} flexItem />
          <Stack
            flexWrap={"wrap"}
            pl={1}
            pt={1}
            spacing={1}
            direction={{ md: "row", lg: "column" }}
          >
            {distinctLabels.map((l) =>
              selLabels.includes(l) ? (
                <Chip
                  size="small"
                  label={l}
                  variant="outlined"
                  color="primary"
                  onDelete={() => {
                    setSelLabels(selLabels.filter((lab) => lab !== l));
                  }}
                />
              ) : (
                <Chip
                  size="small"
                  label={l}
                  color="primary"
                  onClick={() => {
                    setSelLabels([l, ...selLabels]);
                  }}
                />
              )
            )}
          </Stack>
        </Box>
      </Stack>
    </div>
  );
};

PaperList.propTypes = {
  data: PropTypes.array
}

export default PaperList;
