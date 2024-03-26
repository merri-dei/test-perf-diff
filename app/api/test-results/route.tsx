import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface TestSuiteResult {
  [fileName: string]: { heapSize: number; duration: number };
}

export interface TestSuiteResultsDiff {
  fileName: string;
  heapSizeBefore: number;
  heapSizeAfter: number;
  durationBefore: number;
  durationAfter: number;
}

export interface OptimizationSummary {
  title: string;
  diagnosticsCommand: string;
  description?: string;
  totalTestSuites: number;
  beforeTotalDuration: number;
  afterTotalDuration: number;
  beforeTotalHeapSize: number;
  afterTotalHeapSize: number;
  durationDecreasedCount: number;
  heapSizeDecreasedCount: number;
  durationIncreasedCount: number;
  heapSizeIncreasedCount: number;
}

const getResultsByTestSuite = (resultsFilePath: string) => {
  const resolvedFilePath = path.resolve(resultsFilePath);
  const rawFile = fs.readFileSync(resolvedFilePath, "utf8").trim();
  const results = matter(rawFile);
  const resultsByTestSuite = results.content
    .split("\n")
    .reduce<TestSuiteResult>((accum, result) => {
      const fileName = result.match(/\bsrc\/.+\.(test\.)?tsx?/i)!;
      const heapSize = result.match(/\b[0-9.]+\sMB\b/i)!;
      const duration = result.match(/\b[0-9.]+\ss\b/i)!;

      if (!fileName || !heapSize || !duration) return accum;

      return {
        ...accum,
        [fileName.at(0)!]: {
          heapSize: Number.parseFloat(heapSize.at(0)!),
          duration: Number.parseFloat(duration.at(0)!),
        },
      };
    }, {});

  return resultsByTestSuite;
};

const getOptimizationFrontMatter = (resultsFilePath: string) => {
  const resolvedFilePath = path.resolve(resultsFilePath);
  const rawFile = fs.readFileSync(resolvedFilePath, "utf8").trim();
  const results = matter(rawFile);
  return results.data;
};

const getOptimizationSummary = (
  resultsFilePath: string,
  diffsByFileName: TestSuiteResultsDiff[],
): OptimizationSummary => {
  const fileFrontMatter = getOptimizationFrontMatter(resultsFilePath);
  return diffsByFileName.reduce<OptimizationSummary>(
    (accum, diff) => {
      return {
        ...accum,
        totalTestSuites: accum.totalTestSuites + 1,
        beforeTotalDuration: accum.beforeTotalDuration + diff.durationBefore,
        afterTotalDuration: accum.afterTotalDuration + diff.durationAfter,
        beforeTotalHeapSize: accum.beforeTotalHeapSize + diff.heapSizeBefore,
        afterTotalHeapSize: accum.afterTotalHeapSize + diff.heapSizeAfter,
        durationDecreasedCount:
          accum.durationDecreasedCount +
          (diff.durationBefore > diff.durationAfter ? 1 : 0),
        heapSizeDecreasedCount:
          accum.heapSizeDecreasedCount +
          (diff.heapSizeBefore > diff.heapSizeAfter ? 1 : 0),
        durationIncreasedCount:
          accum.durationIncreasedCount +
          (diff.durationBefore < diff.durationAfter ? 1 : 0),
        heapSizeIncreasedCount:
          accum.heapSizeIncreasedCount +
          (diff.heapSizeBefore < diff.heapSizeAfter ? 1 : 0),
      };
    },
    {
      title: fileFrontMatter.title,
      diagnosticsCommand: fileFrontMatter.command,
      totalTestSuites: 0,
      beforeTotalDuration: 0,
      afterTotalDuration: 0,
      beforeTotalHeapSize: 0,
      afterTotalHeapSize: 0,
      durationDecreasedCount: 0,
      heapSizeDecreasedCount: 0,
      durationIncreasedCount: 0,
      heapSizeIncreasedCount: 0,
    },
  );
};

export async function GET(req: NextRequest) {
  const before = req.nextUrl.searchParams.get("before") || "temp-before";
  const after = req.nextUrl.searchParams.get("after") || "temp-after";
  // if (!TYPES.includes(type)) {
  //   return NextResponse.json(
  //     { message: "Invalid type provided" },
  //     { status: 400 },
  //   );
  // }

  const beforeFileName = `public/${before}.txt`;
  const afterFileName = `public/${after}.txt`;
  const unoptimizedResults = getResultsByTestSuite(beforeFileName);
  const optimizedResults = getResultsByTestSuite(afterFileName);

  const resultsDiffByTestSuite = Object.keys(
    unoptimizedResults,
  ).map<TestSuiteResultsDiff>((fileName) => {
    return {
      fileName,
      heapSizeBefore: unoptimizedResults[fileName].heapSize,
      heapSizeAfter: optimizedResults[fileName].heapSize,
      durationBefore: unoptimizedResults[fileName].duration,
      durationAfter: optimizedResults[fileName].duration,
    };
  });

  return NextResponse.json(
    {
      data: {
        diffs: resultsDiffByTestSuite,
        summary: getOptimizationSummary(beforeFileName, resultsDiffByTestSuite),
      },
    },
    {
      status: 200,
    },
  );
}
