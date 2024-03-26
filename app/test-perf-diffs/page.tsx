"use client";
import React, { Fragment, useEffect, useState } from "react";
import {
  OptimizationSummary,
  TestSuiteResultsDiff,
} from "../api/test-results/route";

const TestPerfDiffs = () => {
  const [testPerfDiffs, setTestPerfDiffs] =
    useState<Array<TestSuiteResultsDiff> | null>(null);
  const [optimizationSummary, setOptimizationSummary] =
    useState<OptimizationSummary | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      try {
        const query = new URLSearchParams(window.location.search);
        const beforeParam = query.get("before") ?? "";
        const afterParam = query.get("after") ?? "";
        const response = await fetch(
          `/api/test-results?before=${beforeParam}&after=${afterParam}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          },
        );

        if (response.ok) {
          const { data } = await response.json();
          setTestPerfDiffs(data.diffs);
          setOptimizationSummary(data.summary);
        } else {
          const { message } = await response.json();
          setApiError(`${response.status}: ${message}`);
        }
      } catch (error) {
        console.error(error);
        setApiError(
          error instanceof Error ? error.message : "An exception occurred.",
        );
      }
    })();
  }, []);

  return (
    <main>
      <h1>Test Optimization Results: {optimizationSummary?.title}</h1>
      <p>Comparison of heap size and duration per test suite.</p>

      {optimizationSummary && (
        <>
          <h2>Diagnostics command</h2>
          <pre>
            <code>{optimizationSummary.diagnosticsCommand}</code>
          </pre>
        </>
      )}

      {testPerfDiffs && (
        <>
          <h2>Results</h2>
          <table align="left">
            {optimizationSummary && (
              <caption>
                <div>
                  Total test suites:&nbsp;
                  <strong>
                    {optimizationSummary.totalTestSuites.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Total duration before optimization:&nbsp;
                  <strong>
                    {optimizationSummary.beforeTotalDuration.toLocaleString()} s
                  </strong>
                </div>
                <div>
                  Total duration after optimization:&nbsp;
                  <strong>
                    {optimizationSummary.afterTotalDuration.toLocaleString()} s
                  </strong>
                </div>
                <div>
                  Total heap size before optimization:&nbsp;
                  <strong>
                    {optimizationSummary.beforeTotalHeapSize.toLocaleString()}{" "}
                    MB
                  </strong>
                </div>
                <div>
                  Total heap size after optimization:&nbsp;
                  <strong>
                    {optimizationSummary.afterTotalHeapSize.toLocaleString()} MB
                  </strong>
                </div>
                <div>
                  Number of test suites with decreased duration:&nbsp;
                  <strong>
                    {optimizationSummary.durationDecreasedCount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Number of test suites with increased duration:&nbsp;
                  <strong>
                    {optimizationSummary.durationIncreasedCount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Number of test suites with decreased heap size:&nbsp;
                  <strong>
                    {optimizationSummary.heapSizeDecreasedCount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Number of test suites with increased heap size:&nbsp;
                  <strong>
                    {optimizationSummary.heapSizeIncreasedCount.toLocaleString()}
                  </strong>
                </div>
              </caption>
            )}
            <tbody>
              {testPerfDiffs.map(
                ({
                  fileName,
                  heapSizeBefore,
                  heapSizeAfter,
                  durationBefore,
                  durationAfter,
                }) => (
                  <Fragment key={fileName}>
                    <tr style={{ backgroundColor: "lightgray" }}>
                      <th key="file-name" colSpan={4}>
                        {fileName}
                      </th>
                    </tr>
                    <tr
                      className={
                        heapSizeBefore > heapSizeAfter
                          ? "success"
                          : heapSizeBefore < heapSizeAfter
                            ? "failure"
                            : undefined
                      }
                    >
                      <th>Heap size:</th>
                      <td>Before: {heapSizeBefore} MB</td>
                      <td>After: {heapSizeAfter} MB</td>
                      <td>Diff: {heapSizeBefore - heapSizeAfter} MB</td>
                    </tr>
                    <tr
                      className={
                        durationBefore > durationAfter
                          ? "success"
                          : durationBefore < durationAfter
                            ? "failure"
                            : undefined
                      }
                    >
                      <th>Duration:</th>
                      <td>Before: {durationBefore} s</td>
                      <td>After: {durationAfter} s</td>
                      <td>
                        Diff: {(durationBefore - durationAfter).toFixed(3)} s
                      </td>
                    </tr>
                  </Fragment>
                ),
              )}
            </tbody>
          </table>
        </>
      )}

      {apiError && <h3>{apiError}</h3>}

      {!testPerfDiffs && !apiError && <h3>Loading...</h3>}
    </main>
  );
};

export default TestPerfDiffs;
